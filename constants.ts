import { Emotion, Gender, Profession, AgentProfile, PersonalityTrait, SpeakingStyle } from './types';

export const PROFESSIONS: Profession[] = Object.values(Profession);
export const EMOTIONS: Emotion[] = Object.values(Emotion);
export const GENDERS: Gender[] = Object.values(Gender);
export const PERSONALITY_TRAITS: PersonalityTrait[] = Object.values(PersonalityTrait);
export const SPEAKING_STYLES: SpeakingStyle[] = Object.values(SpeakingStyle); // ADDED: Export speaking styles
// EXPANDED: Added more voice options for greater variety.
export const PREBUILT_VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Aries', 'Orion', 'Cygnus', 'Lyra', 'Aquila'] as const;
export type PrebuiltVoice = typeof PREBUILT_VOICES[number];


export const AGENT_PROFILES: AgentProfile[] = [
    {
        id: 'agent-1',
        name: 'Priya Sharma',
        profession: Profession.Doctor,
        emotion: Emotion.Empathetic,
        gender: Gender.Female,
        age: 32,
        personalityTraits: [PersonalityTrait.Nurturing, PersonalityTrait.Methodical, PersonalityTrait.Supportive],
        avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Priya',
        voiceName: 'Kore',
        speakingStyle: SpeakingStyle.Calm,
    },
    {
        id: 'agent-2',
        name: 'Rohan Verma',
        profession: Profession.SoftwareEngineer,
        emotion: Emotion.Sarcastic,
        gender: Gender.Male,
        age: 24,
        personalityTraits: [PersonalityTrait.Sarcastic, PersonalityTrait.Playful, PersonalityTrait.Extroverted, PersonalityTrait.Humorous, PersonalityTrait.Pragmatic],
        avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Rohan',
        voiceName: 'Puck',
        speakingStyle: SpeakingStyle.Expressive,
    },
    {
        id: 'agent-3',
        name: 'Dr. Anjali Rao',
        profession: Profession.Scientist,
        emotion: Emotion.Serious,
        gender: Gender.Female,
        age: 45,
        personalityTraits: [PersonalityTrait.Serious, PersonalityTrait.Analytical, PersonalityTrait.Pessimistic, PersonalityTrait.Methodical],
        avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Anjali',
        voiceName: 'Charon',
        speakingStyle: SpeakingStyle.Formal,
    },
    {
        id: 'agent-4',
        name: 'Vikram Singh',
        profession: Profession.Lawyer,
        emotion: Emotion.Focused,
        gender: Gender.Male,
        age: 60,
        personalityTraits: [PersonalityTrait.Serious, PersonalityTrait.Introverted, PersonalityTrait.Competitive, PersonalityTrait.Analytical],
        avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Vikram',
        voiceName: 'Fenrir',
        speakingStyle: SpeakingStyle.Serious,
    },
    {
        id: 'agent-5',
        name: 'Meera Kapoor',
        profession: Profession.Artist,
        emotion: Emotion.Happy,
        gender: Gender.Female,
        age: 28,
        personalityTraits: [PersonalityTrait.Creative, PersonalityTrait.Extroverted, PersonalityTrait.Spontaneous, PersonalityTrait.Idealistic, PersonalityTrait.Optimistic],
        avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Meera',
        voiceName: 'Zephyr',
        speakingStyle: SpeakingStyle.Cheerful,
    },
];

export const EMOTION_AVATAR_MAP: Record<Emotion, string> = {
    [Emotion.Happy]: "😊",
    [Emotion.Calm]: "😌",
    [Emotion.Empathetic]: "🤗",
    [Emotion.Energetic]: "⚡️",
    [Emotion.Sarcastic]: "😏",
    [Emotion.Playful]: "😜",
    [Emotion.Serious]: "🧐",
    [Emotion.Passionate]: "🔥",
    [Emotion.Curious]: "🤔",
    [Emotion.Hopeful]: "✨",
    [Emotion.Reserved]: "😳",
    [Emotion.Friendly]: "👋",
    [Emotion.Warm]: "☀️",
    [Emotion.Excited]: "🎉",
    [Emotion.Focused]: "🎯",
    // FIX: Added avatar for the new Neutral emotion.
    [Emotion.Neutral]: "😐",
};

export const PROFESSION_ICON_MAP: Record<Profession, string> = {
    // FIX: Added icon for the new Friend profession.
    [Profession.Friend]: "🤝",
    [Profession.BusinessConsultant]: "💼",
    [Profession.Lawyer]: "⚖️",
    [Profession.ActorModel]: "🎭",
    [Profession.Pilot]: "✈️",
    [Profession.Doctor]: "🩺",
    [Profession.SoftwareEngineer]: "💻",
    [Profession.Nurse]: "🩹",
    [Profession.Teacher]: "🧑‍🏫",
    [Profession.Scientist]: "🔬",
    [Profession.Artist]: "🎨",
    [Profession.SalesRepresentative]: "📈",
    [Profession.CustomerService]: "🎧",
    [Profession.MarketingManager]: "📊",
    [Profession.DataScientist]: "💾",
    [Profession.AISpecialist]: "🤖",
};