import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from '../db/inMemoryStore.js';
import { ENV } from '../config/env.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && ENV.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: ENV.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Function declarations for tool calling
const searchServicesTool: FunctionDeclaration = {
  name: 'searchServices',
  description: 'Search available home services by keyword or category (e.g. plumbing, electrician, AC, cleaning, painting)',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Search keyword for the service needed, e.g. "pipe leak", "switch", "ac cooling"',
      },
      category: {
        type: Type.STRING,
        description: 'Service category slug like electrician, plumbing, ac-repair, home-cleaning',
      },
    },
    required: ['query'],
  },
};

const searchProvidersTool: FunctionDeclaration = {
  name: 'searchProviders',
  description: 'Search verified service professionals by category, location, or name',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: 'Category slug such as electrician, plumbing, ac-repair, home-cleaning',
      },
      location: {
        type: Type.STRING,
        description: 'City or area name e.g. "Metro City", "Westwood", "Downtown"',
      },
    },
  },
};

const getBookingStatusTool: FunctionDeclaration = {
  name: 'getBookingStatus',
  description: 'Retrieve current status and timeline for a booking using booking number or ID',
  parameters: {
    type: Type.OBJECT,
    properties: {
      bookingNumber: {
        type: Type.STRING,
        description: 'Booking reference number (e.g. FM-2026-1001)',
      },
    },
    required: ['bookingNumber'],
  },
};

// Tool executors
function executeTool(name: string, args: any, currentUserId?: string) {
  if (name === 'searchServices') {
    const q = (args.query || '').toLowerCase();
    const cat = (args.category || '').toLowerCase();
    const results = db.services.filter(s => {
      const matchQ = s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      const matchCat = cat ? s.categorySlug.toLowerCase() === cat : true;
      return matchQ && matchCat;
    });
    return {
      count: results.length,
      services: results.map(s => ({
        id: s._id,
        name: s.name,
        category: s.categorySlug,
        basePrice: `$${s.basePrice}`,
        estimatedDuration: s.estimatedDuration,
        included: s.included,
      })),
    };
  }

  if (name === 'searchProviders') {
    const cat = (args.category || '').toLowerCase();
    const loc = (args.location || '').toLowerCase();
    const results = db.providers.filter(p => {
      if (!p.isVerified || p.verificationStatus !== 'APPROVED') return false;
      const matchCat = cat ? p.serviceCategories.includes(cat) : true;
      const matchLoc = loc ? p.serviceAreas.some(a => a.toLowerCase().includes(loc)) : true;
      return matchCat && matchLoc;
    });
    return {
      count: results.length,
      providers: results.map(p => ({
        id: p._id,
        name: p.name,
        rating: p.rating,
        reviews: p.reviewCount,
        experienceYears: p.experienceYears,
        areas: p.serviceAreas,
        categories: p.serviceCategories,
        workingHours: `${p.workingHours.start} - ${p.workingHours.end}`,
      })),
    };
  }

  if (name === 'getBookingStatus') {
    const bk = db.bookings.find(
      b => b.bookingNumber.toLowerCase() === (args.bookingNumber || '').toLowerCase() || b._id === args.bookingNumber
    );
    if (!bk) {
      return { found: false, message: 'No booking found with this reference number.' };
    }
    return {
      found: true,
      bookingNumber: bk.bookingNumber,
      serviceName: bk.serviceName,
      providerName: bk.providerName,
      status: bk.status,
      date: bk.bookingDate,
      timeSlot: bk.timeSlot,
      paymentStatus: bk.paymentStatus,
      amount: `$${bk.amount}`,
      latestUpdate: bk.timeline[bk.timeline.length - 1]?.note || bk.status,
    };
  }

  return { error: `Tool ${name} not recognized.` };
}

export async function askFixMateAi(prompt: string, conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }> = [], currentUserId?: string) {
  const client = getAiClient();

  const systemInstruction = `You are FixMate AI, an intelligent home-services concierge for FixMate.
FixMate connects homeowners and renters with verified local home service pros (Electricians, Plumbers, AC Repair, Cleaning, Carpenters, Painters, Appliance Repair, Pest Control).

Key capabilities:
1. Help identify the right service for a user's problem (e.g. if sink leaks, recommend Plumbing; if flickering lights, Electrician).
2. Use tools to look up real services, verified providers, and check booking status.
3. NEVER fabricate providers, pricing, or bookings. Use the tools.
4. For dangerous situations (gas leaks, active electrical sparks, structural collapse), advise the user to contact emergency services or shut off mains immediately before booking a pro.
5. Do not cancel bookings or execute payments on your own; guide the user to the proper button in the FixMate interface.
Keep responses concise, friendly, helpful, and formatted with markdown bullet points where appropriate.`;

  // Fallback heuristic if API key is not yet set or in offline mode
  if (!client) {
    const lower = prompt.toLowerCase();
    let serviceCategory = '';
    if (lower.includes('leak') || lower.includes('tap') || lower.includes('sink') || lower.includes('pipe') || lower.includes('water')) {
      serviceCategory = 'plumbing';
    } else if (lower.includes('electric') || lower.includes('switch') || lower.includes('light') || lower.includes('spark') || lower.includes('fan')) {
      serviceCategory = 'electrician';
    } else if (lower.includes('ac') || lower.includes('air condition') || lower.includes('cool') || lower.includes('cooling')) {
      serviceCategory = 'ac-repair';
    } else if (lower.includes('clean') || lower.includes('wash') || lower.includes('stain') || lower.includes('dust')) {
      serviceCategory = 'home-cleaning';
    }

    if (serviceCategory) {
      const providers = db.providers.filter(p => p.serviceCategories.includes(serviceCategory));
      return {
        reply: `I see you might need **${serviceCategory.toUpperCase()}** service! We have ${providers.length} verified pros available right now in your area including **${providers[0]?.name || 'Top Rated Specialists'}** (Rated ${providers[0]?.rating || 4.9} ★). You can view their profiles and select a convenient time slot right here on FixMate.`,
        suggestedCategory: serviceCategory,
        toolCalls: [
          {
            name: 'searchProviders',
            result: { count: providers.length, category: serviceCategory },
          }
        ],
      };
    }

    if (lower.includes('booking') || lower.includes('status')) {
      const sample = db.bookings[0];
      return {
        reply: `You can track all your active appointments anytime under the **Bookings** tab! For example, booking **${sample?.bookingNumber || 'FM-2026-1001'}** is currently **${sample?.status || 'CONFIRMED'}**. Let me know if you would like me to look up a specific booking reference!`,
        toolCalls: [],
      };
    }

    return {
      reply: `Hello! I'm FixMate AI. I can help you diagnose home repair issues, find verified electricians, plumbers, AC technicians, and cleaners, or check the status of your bookings. What can I assist you with today?`,
      toolCalls: [],
    };
  }

  try {
    const formattedHistory = conversationHistory.slice(-6).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
      config: {
        systemInstruction,
        tools: [{
          functionDeclarations: [searchServicesTool, searchProvidersTool, getBookingStatusTool],
        }],
      },
    });

    const toolCallsExecuted: any[] = [];
    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const toolResults = functionCalls.map(call => {
        const toolName = call.name || 'unknown';
        const result = executeTool(toolName, call.args, currentUserId);
        toolCallsExecuted.push({ name: toolName, args: call.args, result });
        return { toolName, result };
      });

      // Construct immediate, responsive synthesis
      let synthesis = '';
      for (const tr of toolResults) {
        if (tr.toolName === 'searchServices' && tr.result.services) {
          synthesis += `I found **${tr.result.count} matching service${tr.result.count !== 1 ? 's' : ''}**:\n` +
            tr.result.services.slice(0, 3).map((s: any) => `• **${s.name}** (${s.basePrice}, ~${s.estimatedDuration})`).join('\n');
        } else if (tr.toolName === 'searchProviders' && tr.result.providers) {
          synthesis += `We have **${tr.result.count} verified professional${tr.result.count !== 1 ? 's' : ''}** available in your area:\n` +
            tr.result.providers.slice(0, 3).map((p: any) => `• **${p.name}** — ${p.rating} ★ (${p.reviews} reviews, ${p.experienceYears} yrs exp)`).join('\n') +
            `\n\nYou can click on their profile in the Services catalog to select your preferred appointment window!`;
        } else if (tr.toolName === 'getBookingStatus') {
          if (tr.result.found) {
            synthesis += `Here is your booking update:\n• Reference: **${tr.result.bookingNumber}**\n• Service: **${tr.result.serviceName}** with **${tr.result.providerName}**\n• Status: **${tr.result.status}**\n• Scheduled: **${tr.result.date} (${tr.result.timeSlot})**\n• Latest note: *${tr.result.latestUpdate}*`;
          } else {
            synthesis += tr.result.message;
          }
        }
      }

      return {
        reply: synthesis || response.text || 'I retrieved the latest information for you.',
        toolCalls: toolCallsExecuted,
      };
    }

    return {
      reply: response.text || 'I am ready to help with your home service needs.',
      toolCalls: toolCallsExecuted,
    };
  } catch (error: any) {
    console.error('[Gemini AI Service Error]:', error.message || error);
    // Graceful fallback logic
    const lower = prompt.toLowerCase();
    let serviceCategory = '';
    if (lower.includes('leak') || lower.includes('tap') || lower.includes('sink') || lower.includes('pipe') || lower.includes('water')) {
      serviceCategory = 'plumbing';
    } else if (lower.includes('electric') || lower.includes('switch') || lower.includes('light') || lower.includes('spark') || lower.includes('fan')) {
      serviceCategory = 'electrician';
    } else if (lower.includes('ac') || lower.includes('air condition') || lower.includes('cool') || lower.includes('cooling')) {
      serviceCategory = 'ac-repair';
    } else if (lower.includes('clean') || lower.includes('wash') || lower.includes('stain') || lower.includes('dust')) {
      serviceCategory = 'home-cleaning';
    }

    if (serviceCategory) {
      const providers = db.providers.filter(p => p.serviceCategories.includes(serviceCategory));
      return {
        reply: `I diagnosed that this issue falls under our **${serviceCategory.toUpperCase()}** department. We have ${providers.length} verified pros available in your area including **${providers[0]?.name || 'Top Specialists'}** (${providers[0]?.rating || 4.9} ★). You can view their profiles and select an open time slot under the Services tab!`,
        suggestedCategory: serviceCategory,
        toolCalls: [
          {
            name: 'searchProviders',
            result: { count: providers.length, category: serviceCategory, providers },
          },
        ],
      };
    }

    return {
      reply: `I can help connect you with our top verified professionals for plumbing, electrical, AC repair, and cleaning. Please select a service category above or visit the Services catalog to book directly!`,
      toolCalls: [],
    };
  }
}
