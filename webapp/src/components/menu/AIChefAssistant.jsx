import React, { useState } from 'react';
import { ChefHat, Sparkles, X, Send, Plus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';

export const AIChefAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const { menuItems } = useRestaurant();
  const { addToCart } = useCart();
  const [addedItemKey, setAddedItemKey] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'chef',
      text: "Bonjour & Namaste! I'm Chef Aria, your AI culinary guide at Food House. Not sure what to order, or have diet preferences? Ask me!",
      dishes: [],
    },
  ]);

  const quickPrompts = [
    'What goes well with Paneer Pizza?',
    'Chef recommendations for 2 people?',
    'Are there any spicy dishes?',
    'Best desserts today?',
  ];

  const handleSend = (userText) => {
    const text = userText || inputMessage;
    if (!text.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // AI intelligent recommendation logic
    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseText = '';
      let recommendedDishes = [];

      if (lower.includes('pizza') || lower.includes('paneer') || lower.includes('pair')) {
        responseText =
          'Paneer Pizza pairs wonderfully with our artisanal Cold Coffee (₹89) or crispy Peri-Peri French Fries (₹100). The cool espresso cuts through the rich mozzarella cheese perfectly!';
        recommendedDishes = menuItems.filter(
          (m) => m.name.includes('Cold Coffee') || m.name.includes('French Fries')
        );
      } else if (lower.includes('2 people') || lower.includes('recommend') || lower.includes('combo')) {
        responseText =
          "For 2 diners, our Chef's Top Pick is 1 Medium Paneer Pizza + 1 Special Royal Thali + 2 Cold Coffees. You get a taste of royal Indian gravies and stone-oven pizza!";
        recommendedDishes = menuItems.filter(
          (m) => m.name.includes('Paneer Pizza') || m.name.includes('Special Royal Thali')
        );
      } else if (lower.includes('spicy') || lower.includes('chilli')) {
        responseText =
          'If you love heat, our Peri-Peri French Fries dusted with African peri-peri spices and the Veg Hakka Noodles with garlic chilli punch will hit the spot!';
        recommendedDishes = menuItems.filter(
          (m) => m.name.includes('French Fries') || m.name.includes('Hakka Noodles')
        );
      } else if (lower.includes('dessert') || lower.includes('sweet')) {
        responseText =
          'You must try our sizzling Chocolate Brownie with Ice Cream (₹169)! It features warm Belgian dark chocolate fudge with Madagascar vanilla ice cream.';
        recommendedDishes = menuItems.filter((m) => m.name.includes('Brownie'));
      } else {
        responseText =
          'Everything on our menu is prepared fresh to order! Our top bestseller today is the Stone-Oven Paneer Pizza (₹249) followed by creamy Pasta Alfredo (₹229).';
        recommendedDishes = menuItems.slice(0, 2);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'chef',
          text: responseText,
          dishes: recommendedDishes,
        },
      ]);
    }, 600);
  };

  const handleQuickAdd = (dish) => {
    addToCart(dish, dish.variants?.[0] || null, [], '', 1);
    setAddedItemKey(dish.id);
    setTimeout(() => setAddedItemKey(null), 1500);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 bg-secondary-900 hover:bg-black text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 border border-secondary-700 hover:scale-105 transition active:scale-95 group font-sans"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-primary flex items-center justify-center text-white shadow-sm">
            <ChefHat className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left pr-1 hidden sm:block">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Culinary Copilot</span>
            </div>
            <div className="text-xs font-extrabold text-white">Ask Chef Aria</div>
          </div>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-secondary-800 flex flex-col overflow-hidden max-h-[520px] font-sans animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 p-4 text-white flex items-center justify-between border-b border-secondary-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-primary flex items-center justify-center text-white shadow-sm">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black flex items-center gap-1.5">
                  <span>Chef Aria</span>
                  <span className="text-[9px] bg-primary/40 text-amber-300 font-bold px-1.5 py-0.5 rounded-full border border-primary/50">
                    AI CHEF
                  </span>
                </div>
                <div className="text-[10px] text-gray-400">Instant dish advice & pairings</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-secondary-800 hover:bg-secondary-700 flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs bg-gray-50/50 dark:bg-secondary-950/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-secondary-800 text-secondary-900 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-secondary-700 shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Recommended Dishes Inside Chat */}
                  {m.dishes && m.dishes.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-secondary-700 space-y-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Suggested Items
                      </div>
                      {m.dishes.map((dish) => (
                        <div
                          key={dish.id}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-gray-50 dark:bg-secondary-900 border border-gray-200 dark:border-secondary-700"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-[11px] truncate text-secondary-900 dark:text-white">
                                {dish.name}
                              </div>
                              <div className="text-[10px] text-primary font-black">
                                {formatINR(dish.price)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleQuickAdd(dish)}
                            className="px-2 py-1 bg-primary hover:bg-primary-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 flex-shrink-0 shadow-sm transition"
                          >
                            {addedItemKey === dish.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompt Pills */}
          <div className="p-2 border-t border-gray-100 dark:border-secondary-800 bg-white dark:bg-secondary-900 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-secondary-800 hover:bg-primary/10 hover:text-primary text-gray-600 dark:text-gray-300 text-[10px] font-medium whitespace-nowrap transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white dark:bg-secondary-900 border-t border-gray-100 dark:border-secondary-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about our food..."
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-gray-50 dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-primary text-white hover:bg-primary-600 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

