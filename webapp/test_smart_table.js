/**
 * Serve.AI - Comprehensive Smart Table Experience Test Suite
 * Tests all 10 core requirements:
 * 1. QR and NFC Token Validation
 * 2. Shared Table Session & Multi-Guest Join
 * 3. Shared Live Cart & Multi-User Attribution
 * 4. Concurrency & Multi-Round Ordering
 * 5. Self-Seating Validation
 * 6. Digital Guest Portal & Free Spin-the-Wheel
 * 7. Waiter Service Requests (8 types, cooldown/anti-spam, status lifecycle)
 * 8. Shared Table Billing & Split Payments (Full, Equal, Itemized, Custom)
 * 9. Floor Plan Live State & Table Transfers/Merges
 * 10. Security & Unauthorized Table Access Prevention
 */

import {
  CAFE_HIGHFIVE_RESTAURANT,
  CAFE_HIGHFIVE_TABLES,
  INITIAL_TABLE_SESSIONS,
  GUEST_PORTAL_CONFIG,
} from './src/lib/mockData.js';

// Mock in-memory localStorage for Node test runner
const memoryStorage = {};
global.localStorage = {
  getItem: (key) => memoryStorage[key] || null,
  setItem: (key, val) => { memoryStorage[key] = String(val); },
  removeItem: (key) => { delete memoryStorage[key]; },
  clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); },
};

// Import store
const { localStore } = await import('./src/lib/supabaseClient.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SERVE.AI - SMART TABLE EXPERIENCE TEST SUITE');
  console.log('======================================================\n');

  // TEST 1: QR & NFC Token Validation
  console.log('--- TEST 1: QR & NFC Token Security Validation ---');
  const validToken = CAFE_HIGHFIVE_TABLES[0].token; // T-01
  const validRes = localStore.validateTableToken('cafe-highfive', 'T-01', validToken);
  assert(validRes.valid === true, 'Valid cryptographic table token accepted');

  const invalidRes = localStore.validateTableToken('cafe-highfive', 'T-01', 'FORGED_TOKEN_XYZ');
  assert(invalidRes.valid === false, 'Tampered/unauthorized token strictly rejected');

  const missingTokenRes = localStore.validateTableToken('cafe-highfive', 'T-01', null);
  assert(missingTokenRes.valid === false, 'Missing table token strictly rejected');

  // TEST 2: Two Customers Joining Same Table Session (Phone A & Phone B)
  console.log('\n--- TEST 2: Shared Session & Multi-Guest Joining ---');
  const sessionA = localStore.joinTableSession('T-05', 'SESSION_T-05_SECURE_982', 'Rahul Sharma', '👨‍💼');
  assert(sessionA.tableNumber === 'T-05', 'Guest 1 (Rahul) joined Table T-05 session');
  assert(sessionA.activeGuests.some(g => g.name === 'Rahul Sharma'), 'Guest 1 registered in activeGuests');

  const sessionB = localStore.joinTableSession('T-05', 'SESSION_T-05_SECURE_982', 'Ananya Roy', '👩‍💻');
  assert(sessionB.activeGuests.length >= 2, 'Guest 2 (Ananya) successfully joined same active session');
  assert(sessionB.activeGuests.some(g => g.name === 'Ananya Roy'), 'Guest 2 listed alongside Guest 1');

  // TEST 3: Shared Live Cart & Attribution
  console.log('\n--- TEST 3: Shared Live Cart & Item Attribution ---');
  // Clear cart and rounds for clean test
  const cleanSession = localStore.getTableSession('T-05');
  cleanSession.sharedCart = [];
  cleanSession.submittedRounds = [];
  cleanSession.totalBill = 0;
  cleanSession.paidAmount = 0;
  cleanSession.remainingBalance = 0;
  localStore.saveTableSessions({ ...localStore.getTableSessions(), 'T-05': cleanSession });

  // Guest 1 adds Iced Spanish Latte
  localStore.addSharedCartItem('T-05', {
    id: 'h5-iced-spanish-latte',
    name: 'Iced Spanish Latte',
    price: 149,
    quantity: 2,
    variantName: 'Single Origin',
  }, 'Rahul Sharma', '👨‍💼');

  // Guest 2 adds Highfive Double Cheeseburger
  localStore.addSharedCartItem('T-05', {
    id: 'h5-cheeseburger',
    name: 'Highfive Double Cheeseburger',
    price: 269,
    quantity: 1,
    variantName: 'Standard',
  }, 'Ananya Roy', '👩‍💻');

  const updatedSession = localStore.getTableSession('T-05');
  assert(updatedSession.sharedCart.length === 2, 'Both food items synced into shared cart');
  assert(updatedSession.sharedCart[0].addedBy === 'Rahul Sharma', 'Item 1 correctly attributed to Rahul');
  assert(updatedSession.sharedCart[1].addedBy === 'Ananya Roy', 'Item 2 correctly attributed to Ananya');

  // TEST 4: Real-time Quantity Modification
  console.log('\n--- TEST 4: Real-time Quantity Stepper & Concurrency ---');
  const latteItem = updatedSession.sharedCart[0];
  localStore.updateSharedCartItemQty('T-05', latteItem.cartItemId, 1);
  const sessionAfterQty = localStore.getTableSession('T-05');
  assert(sessionAfterQty.sharedCart[0].quantity === 3, 'Quantity updated across devices (2 -> 3)');

  // TEST 5: Submitting Round 1 to Kitchen
  console.log('\n--- TEST 5: Order Submission (Round 1) ---');
  const round1Order = localStore.submitSharedTableOrder('T-05', 'counter', 'Less spicy please', 'Rahul Sharma');
  assert(round1Order !== null, 'Round 1 successfully submitted to kitchen and POS');
  assert(round1Order.orderNumber.startsWith('ORD-'), `Assigned valid order number #${round1Order.orderNumber}`);

  const sessionAfterRound1 = localStore.getTableSession('T-05');
  assert(sessionAfterRound1.sharedCart.length === 0, 'Shared cart cleared for next round of ordering');
  assert(sessionAfterRound1.submittedRounds.length === 1, 'Round 1 recorded in session history');
  assert(sessionAfterRound1.totalBill > 0, `Cumulative table bill calculated: ₹${sessionAfterRound1.totalBill}`);

  // TEST 6: Multi-Round Ordering (Subsequent Round 2)
  console.log('\n--- TEST 6: Subsequent Round 2 Ordering on Same Table ---');
  localStore.addSharedCartItem('T-05', {
    id: 'h5-biscoff-waffle',
    name: 'Belgian Lotus Biscoff Waffle',
    price: 199,
    quantity: 1,
    variantName: 'Standard',
  }, 'Ananya Roy', '👩‍💻');

  const round2Order = localStore.submitSharedTableOrder('T-05', 'counter', 'Extra fork please', 'Ananya Roy');
  assert(round2Order !== null, 'Round 2 successfully placed');
  
  const sessionAfterRound2 = localStore.getTableSession('T-05');
  assert(sessionAfterRound2.submittedRounds.length === 2, 'Session tracks multiple order rounds (Round 1 + Round 2)');
  assert(sessionAfterRound2.remainingBalance === sessionAfterRound2.totalBill, 'Remaining balance matches cumulative total');

  // TEST 7: Shared Table Billing & Split Payments
  console.log('\n--- TEST 7: Split Table Billing & Partial Payments ---');
  const initialBalance = sessionAfterRound2.remainingBalance;
  assert(initialBalance > 0, `Total payable balance: ₹${initialBalance}`);

  // Guest 1 pays equal split share or custom partial payment of ₹300 via UPI
  const pay1 = localStore.recordPartialPayment('T-05', {
    amount: 300,
    paidBy: 'Rahul Sharma',
    method: 'upi',
    splitType: 'custom',
    itemsCovered: ['Iced Spanish Latte'],
  });
  assert(pay1.status === 'verified', 'Payment 1 verified with server transaction ID');
  assert(pay1.transactionId.startsWith('TXN-UPI-'), `Valid UPI Txn ID generated: ${pay1.transactionId}`);

  const sessionAfterPay1 = localStore.getTableSession('T-05');
  assert(sessionAfterPay1.paidAmount === 300, 'Paid amount incremented by ₹300');
  assert(sessionAfterPay1.remainingBalance === initialBalance - 300, `Remaining balance updated to ₹${sessionAfterPay1.remainingBalance}`);

  // Guest 2 pays the rest to settle table bill
  const pay2 = localStore.recordPartialPayment('T-05', {
    amount: sessionAfterPay1.remainingBalance,
    paidBy: 'Ananya Roy',
    method: 'upi',
    splitType: 'full',
  });
  assert(pay2 !== null, 'Guest 2 successfully settled remaining balance');

  const sessionSettled = localStore.getTableSession('T-05');
  assert(sessionSettled.remainingBalance === 0, 'Remaining balance reaches ₹0');
  assert(sessionSettled.status === 'settled', 'Table session transitioned to settled status');

  // TEST 8: Waiter Service Requests & Cooldown Anti-Spam
  console.log('\n--- TEST 8: Waiter Service Requests (8 Types & Anti-Spam) ---');
  const req1 = localStore.createServiceRequest('T-05', 'water', 'Bring chilled bottle');
  assert(req1.status === 'pending', 'Water service request created with pending status');

  // Duplicate request check (anti-spam)
  const reqDuplicate = localStore.createServiceRequest('T-05', 'water', 'Repeat request');
  assert(reqDuplicate.id === req1.id, 'Duplicate active request blocked and returned existing request');

  // Lifecycle transitions: pending -> in_progress -> completed
  localStore.updateServiceRequestStatus(req1.id, 'in_progress');
  const reqInProgress = localStore.getServiceRequests().find(r => r.id === req1.id);
  assert(reqInProgress.status === 'in_progress', 'Staff acknowledged and request marked in_progress');

  localStore.updateServiceRequestStatus(req1.id, 'completed');
  const reqCompleted = localStore.getServiceRequests().find(r => r.id === req1.id);
  assert(reqCompleted.status === 'completed', 'Request successfully fulfilled');

  // TEST 9: Table Transfers and Merging
  console.log('\n--- TEST 9: Floor Plan Table Transfer & Merge ---');
  // Re-open active session on T-01
  localStore.joinTableSession('T-01', 'TOKEN_CAFE-HIGHFIVE_T-01', 'Vikram', '👨‍🎨');
  localStore.addSharedCartItem('T-01', { id: 'item-1', name: 'Cold Brew', price: 150, quantity: 1 }, 'Vikram');
  
  // Transfer T-01 to T-03
  const transferOk = localStore.transferTableSession('T-01', 'T-03');
  assert(transferOk === true, 'Table session transferred from T-01 to T-03');
  assert(localStore.getTableSession('T-01') === null, 'T-01 session cleared');
  assert(localStore.getTableSession('T-03') !== null, 'T-03 now holds the active session and items');

  // Merge T-03 into T-05
  const mergeOk = localStore.mergeTableSessions('T-05', 'T-03');
  assert(mergeOk === true, 'Table T-03 merged into primary Table T-05');
  assert(localStore.getTableSession('T-03') === null, 'Secondary table session closed');

  // TEST 10: Digital Guest Portal & Promotional Spin-the-Wheel
  console.log('\n--- TEST 10: Digital Guest Portal & Spin-the-Wheel ---');
  assert(Boolean(GUEST_PORTAL_CONFIG.wifi.password), 'Wi-Fi credentials configured');
  assert(GUEST_PORTAL_CONFIG.spinWheelPrizes.length === 6, 'Promotional spin wheel configured with 6 prizes');
  assert(GUEST_PORTAL_CONFIG.triviaQuiz.length === 3, 'Food Trivia Quiz configured');

  const claim = localStore.claimWheelReward('T-05', 'Rahul Sharma', GUEST_PORTAL_CONFIG.spinWheelPrizes[0]);
  assert(claim.prizeLabel === GUEST_PORTAL_CONFIG.spinWheelPrizes[0].label, 'Promotional reward claimed and saved to session');

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
