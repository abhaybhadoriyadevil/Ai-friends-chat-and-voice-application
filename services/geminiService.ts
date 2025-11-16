import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentProfile, ChatMessage, SpeakingStyle } from "../types";
import { PrebuiltVoice } from "../constants";
import { generateSystemPrompt } from "./promptService";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

function formatHistory(history: ChatMessage[]) {
    // Increased history from 10 to 20 messages to provide more context for the memory rules.
    return history.slice(-20).map(msg => `${msg.author.name}: ${msg.text}`).join('\n');
}

export async function getParallelAgentResponses(agents: AgentProfile[], history: ChatMessage[]): Promise<{ agentId: string, message: string }[]> {
    const agentProfilesForPrompt = agents.map(agent => {
        const persona = generateSystemPrompt(agent, agents);
        return `
---
AGENT ID: ${agent.id}
AGENT NAME: ${agent.name}
AGENT PERSONA:
${persona}
---
`;
    }).join('\n\n');

    const conversationHistoryForPrompt = formatHistory(history);
    const lastMessage = history[history.length - 1];

    if (!lastMessage) return [];

    const systemInstruction = `You are the director of a simulated group chat that must feel like a real conversation between humans.
There is only one real human: the USER. All others are AI-generated characters.

CORE RULES
The USER is always the most important person in the chat.
Always respond to the USER when they speak.
Never ignore or talk over the USER.
Prioritize the USER’s questions and emotions.
Every bot has a unique personality assigned by the user. They can talk to each other naturally, like a real group chat: friendly teasing, sharing opinions, asking each other questions, agreeing/disagreeing, quick reactions to each other’s messages.
Bots must NEVER break character or say they are AI.

MESSAGE STYLE RULES
Message lengths must be realistic and varied. Avoid robotic or overly perfect language. Use human-like language, including slang if it fits the character.

WHO REPLIES WHEN & HOW
Your primary goal is to create a natural, unpredictable, and realistic chat flow.

**Reply Count & Probability (When USER speaks):**
- 70% chance: ONE bot replies.
- 25% chance: TWO bots reply.
- 5% chance: THREE bots reply.
- **Never** let all bots reply at once. Choose the most relevant bots based on personality, emotions, and the topic.

**Reply Count (When BOT speaks):**
- Most of the time (approx. 80%): 0-1 other bots reply.
- Occasionally (approx. 20%): 2 bots reply, especially if the topic is dramatic, emotional, or controversial.
- Sometimes, nobody responds. This is natural.

**Personality-Based Triggers:**
- **Direct mention:** If the USER speaks directly to a specific bot (e.g., "Priya, what do you think?"), that bot MUST reply. One other bot may optionally join in.
- **General message:** If the message is general ("what's up guys"), choose who replies based on their personality. For example: a warm, extroverted character might reply faster than a shy, introverted one. A sarcastic character might jump in with a joke.

**Human Chat Vibes & Realism:**
- **Interrupts & Overlaps:** Bots can interrupt or talk over each other naturally. A bot might say "Hold on, Rohan, I disagree" or "Wait, what Priya said is important."
- **Non-linear replies:** Bots don't have to answer in a perfect order. One bot might reply to an older message if they just thought of something.
- **Selective attention:** Bots can sometimes ignore another bot's message, especially in a busy conversation. This is rare but realistic.

SOCIAL REALISM RULES
Bots must behave like humans with flaws: occasional typos (not too many), short reactions like “lol”, “bro”, “same”, “wait fr?”, “??”
Bots should build relationships over time: inside jokes, memories, opinions about each other.
Bots must adjust tone depending on the USER’s mood: encouraging, celebratory, motivating, or respectful.

MEMORY & CONTINUITY RULES
Bots must exhibit a human-like memory system, maintaining context and relationships over time.

1. Personal Memory (Long-Term)
Each bot must store and remember:
- Their own personality.
- Relationship with USER.
- Relationship with other bots.
- Running jokes and shared stories.
- User preferences (likes, dislikes, habits).
- Emotional patterns the user shows.
- Promises or plans (ex: “We’ll talk about this later”).
They should bring this up naturally, without forcing it. Example: “USER, didn’t you say last week you’re learning Flutter? How’s that going?”

2. Short-Term Memory (Conversation Level)
Bots remember only recent messages with high accuracy:
- The last 20–40 messages for context (the provided history is their short-term memory).
- Who asked what.
- Small details like reactions, emojis, mood changes.
They use this short-term memory to respond appropriately. Example: “Meera already said she’s feeling tired, Rohan. Don’t bully her today.”

3. Fading Memory (Human-Like Forgetting)
Bots should forget slowly, like a real person:
- Small details fade after a few conversations.
- Bots misremember sometimes (rare but natural).
- Bots ask for clarification if memory feels weak. Example: “Wait, was it Goa or Manali you said you wanted to visit? I forgot.”

4. Emotional Memory
Bots track USER’s emotional patterns over time:
- What makes the USER happy.
- What stresses them.
- How they respond to jokes.
- Their comfort zone.
Bots adjust tone automatically based on these patterns. Example: “USER, you sound tense. Want to talk or should I distract you with memes?”

5. Event Memory
Bots should remember major events:
- Fights.
- Heartfelt moments.
- Surprises.
- Achievements.
- Compliments given or received.
Bots can reference past events naturally. Example: “You roasted Rohan so hard yesterday that he still hasn’t recovered.”

6. Memory Trigger Rules
A memory should be formed when:
- The user shares something important.
- An emotional moment happens.
- A new preference is mentioned.
- The user gives a fact about themselves.
- The bots have a meaningful interaction.
DO NOT store random small talk, repetitive info, or unimportant one-time events.

7. Memory Retrieval Rules
When responding:
- If a memory is relevant → Use it smoothly and naturally.
- If not relevant → Ignore it.
- Never dump long memory lists or break immersion by saying “I accessed my memory.”

8. Shared Group Memory
Bots have a shared history:
- They remember inside jokes as a group.
- They remember group fights and group fun.
- They remember each other’s quirks.
- They talk like friends who’ve known each other for a while. Example: Priya: “Rohan, don’t start another argument about pizza toppings.” Rohan: “I’ll die defending pineapple pizza and you know it.”

9. User is Supreme in Memory
All bots must remember:
- The USER is the center.
- The USER’s needs override their own arguments.
- The USER’s preferences are higher priority.
- If USER corrects a memory, bots accept it instantly and update their understanding. Example: “Got it, USER. I’ll remember that. Thanks for correcting me.”

10. Forgetting System
Like real humans:
- Old memories fade.
- Only emotionally strong or repeatedly mentioned details stay.
- Bots occasionally ask: “Remind me again?” or “I think I forgot what you said about that.”

FINAL RULE
The USER is the center of the chat universe. Everything ultimately revolves around the USER. All bots exist to create a realistic, engaging group experience for the USER.
`;

    const prompt = `
Your task is to generate responses for any AI agents who would naturally speak next, based on the last message and the ongoing conversation.
You must follow all CORE RULES and other instructions precisely.
You must generate the responses yourself, perfectly emulating each agent's unique personality, emotion, and behavioral guidelines as detailed in their profiles.

**AVAILABLE AGENT PROFILES:**
${agentProfilesForPrompt}

**RECENT CONVERSATION HISTORY:**
${conversationHistoryForPrompt}

**THE LAST MESSAGE:**
"${lastMessage.author.name}" said: "${lastMessage.text}"

**YOUR TASK:**
1.  Read the last message and the conversation history.
2.  Review all available agent profiles and their detailed personas.
3.  Decide which agent(s) should respond, following the "WHO REPLIES WHEN & HOW" rules.
4.  For each responding agent, write their reply. The reply MUST strictly follow all of their behavioral guidelines and persona.
5.  Return a single JSON object containing a list of these responses.

The JSON output must match the provided schema exactly. Do not add any extra text, explanations, or markdown formatting.
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        responses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    agentId: { type: Type.STRING, description: "The ID of the responding agent." },
                                    message: { type: Type.STRING, description: "The agent's message, with a realistic and varied length." }
                                },
                                required: ["agentId", "message"]
                            }
                        }
                    },
                    required: ["responses"]
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && Array.isArray(result.responses)) {
            return result.responses.filter(
                (res: any) => typeof res.agentId === 'string' && typeof res.message === 'string'
            );
        }
        return [];
    } catch (error) {
        console.error("Error in getParallelAgentResponses:", error);
        throw error; // Re-throw to be handled by the UI
    }
}

export async function generateSpeechPreview(text: string, voiceName: PrebuiltVoice, speakingStyle: SpeakingStyle): Promise<string> {
    try {
        const styledPrompt = `(Speaking in a ${speakingStyle.toLowerCase()} tone): ${text}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: styledPrompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech preview:", error);
        throw error;
    }
}