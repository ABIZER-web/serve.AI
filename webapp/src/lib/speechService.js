/**
 * AI Voice Order Announcement System
 * Centralized queue manager with speech synthesis, Indian English/Hindi voice routing,
 * audio lock deduplication, and browser autoplay compliance.
 */

class SpeechAnnouncementService {
  constructor() {
    this.queue = [];
    this.isSpeaking = false;
    this.isUnlocked = false;
    this.announcedOrderIds = new Set();
    this.settings = {
      enabled: true,
      language: 'en-IN', // 'en-IN' or 'hi-IN'
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      announceTableFirst: true,
      announceOrderTotal: true,
    };

    // Load persisted announced IDs from session storage to prevent duplicates on tab reload
    try {
      const saved = sessionStorage.getItem('serveai_announced_orders');
      if (saved) {
        JSON.parse(saved).forEach((id) => this.announcedOrderIds.add(id));
      }
    } catch (e) {}

    // Init voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.getAvailableVoices();
      };
    }
  }

  unlockAudio() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance('Audio ready');
      utterance.volume = 0.01;
      window.speechSynthesis.speak(utterance);
      this.isUnlocked = true;
    } catch (e) {
      console.warn("Audio unlock error:", e);
    }
  }

  getAvailableVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  getBestVoice(lang) {
    const voices = this.getAvailableVoices();
    if (!voices.length) return null;

    // Prefer Indian English or Indian Hindi voices
    if (lang === 'hi-IN') {
      const hiVoice = voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('hindi'));
      if (hiVoice) return hiVoice;
    }

    const inVoice = voices.find((v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india'));
    if (inVoice) return inVoice;

    // Fallback to natural English voice (Google, Samantha, Natural)
    const naturalVoice = voices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.lang.startsWith('en'));
    return naturalVoice || voices[0];
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Convert number to spoken text (e.g., 1001 -> "one zero zero one")
  digitsToWords(numStr) {
    const digitMap = {
      '0': 'zero',
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five',
      '6': 'six',
      '7': 'seven',
      '8': 'eight',
      '9': 'nine',
    };
    return String(numStr)
      .replace(/[^0-9]/g, '')
      .split('')
      .map((d) => digitMap[d] || d)
      .join(' ');
  }

  buildSpokenText(order) {
    const tableNum = order.tableNumber || (order.tables && order.tables.table_number) || 'counter';
    const orderNumDigits = this.digitsToWords(order.orderNumber || order.order_number || '1001');

    // Aggregate items
    const itemsList = order.items || order.order_items || [];
    let itemsSpeech = '';
    if (itemsList.length > 0) {
      const itemPhrases = itemsList.map((item) => {
        const qty = item.quantity || 1;
        const name = item.name || item.item_name || 'Dish';
        return `${qty} ${name}${qty > 1 && !name.endsWith('s') ? 's' : ''}`;
      });

      if (itemPhrases.length === 1) {
        itemsSpeech = itemPhrases[0];
      } else if (itemPhrases.length === 2) {
        itemsSpeech = `${itemPhrases[0]} and ${itemPhrases[1]}`;
      } else {
        const last = itemPhrases.pop();
        itemsSpeech = `${itemPhrases.join(', ')} and ${last}`;
      }
    }

    const total = Math.round(order.grandTotal || order.grand_total || order.total || 0);

    if (this.settings.language === 'hi-IN') {
      return `ध्यान दें स्टाफ! टेबल ${tableNum} के लिए नया ऑर्डर आया है। ऑर्डर नंबर ${orderNumDigits}। ${itemsSpeech}। कुल बिल ${total} रुपये है। कृपया ऑर्डर स्वीकार करें और तैयार करें।`;
    }

    // Default English (Indian accent style)
    return `Attention staff! A new order has been received for Table ${tableNum}. Order number ${orderNumDigits}. ${itemsSpeech}. The total bill is ${total} rupees. Please accept and prepare the order.`;
  }

  // Main entrypoint called upon receiving order
  announceOrder(order, force = false) {
    if (!this.settings.enabled && !force) return;
    if (!order) return;

    const orderId = order.id || order.order_number;
    if (!force && this.announcedOrderIds.has(orderId)) {
      console.log(`[TTS] Order ${orderId} already announced. Skipping duplicate.`);
      return;
    }

    this.announcedOrderIds.add(orderId);
    try {
      sessionStorage.setItem('serveai_announced_orders', JSON.stringify(Array.from(this.announcedOrderIds)));
    } catch (e) {}

    const spokenText = this.buildSpokenText(order);
    this.enqueue(spokenText);
  }

  enqueue(text) {
    this.queue.push(text);
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length === 0) {
      this.isSpeaking = false;
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.queue = [];
      this.isSpeaking = false;
      return;
    }

    this.isSpeaking = true;
    const textToSpeak = this.queue.shift();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = this.settings.rate || 1.0;
    utterance.pitch = this.settings.pitch || 1.0;
    utterance.volume = this.settings.volume || 1.0;

    const voice = this.getBestVoice(this.settings.language);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      // Small pause between multiple queued announcements
      setTimeout(() => {
        this.processQueue();
      }, 400);
    };

    utterance.onerror = (e) => {
      console.warn("[TTS] Utterance error:", e);
      this.processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Test announcement for staff/admin settings
  testAnnouncement() {
    const demoOrder = {
      id: 'test-' + Date.now(),
      orderNumber: 'ORD-1001',
      tableNumber: 'T-05',
      grandTotal: 528,
      items: [
        { name: 'Paneer Pizza', quantity: 2 },
        { name: 'Cold Coffee', quantity: 1 },
        { name: 'French Fries', quantity: 1 },
      ],
    };
    this.announceOrder(demoOrder, true);
  }
}

export const speechService = new SpeechAnnouncementService();

