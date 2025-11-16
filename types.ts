
export enum Gender {
    Male = 'Male',
    Female = 'Female',
    NonBinary = 'Non-binary'
}

export enum Emotion {
    Happy = 'Happy / Cheerful',
    Calm = 'Calm / Serene',
    Empathetic = 'Empathetic / Compassionate',
    Energetic = 'Energetic / Enthusiastic',
    Sarcastic = 'Sarcastic / Witty',
    Playful = 'Playful / Mischievous',
    Serious = 'Serious / Logical',
    Passionate = 'Passionate / Bold',
    Curious = 'Curious / Inquisitive',
    Hopeful = 'Hopeful / Optimistic',
    Reserved = 'Reserved / Shy',
    Friendly = 'Friendly / Supportive',
    Warm = 'Warm / Caring',
    Excited = 'Excited / Joyful',
    Focused = 'Focused / Determined',
    // FIX: Added Neutral emotion to be used as a default for new agents.
    Neutral = 'Neutral',
}

export enum Profession {
    // FIX: Added Friend profession to be used as a default for new agents.
    Friend = 'Friend',
    BusinessConsultant = 'Business Consultant',
    Lawyer = 'Lawyer',
    ActorModel = 'Actor / Model',
    Pilot = 'Commercial Pilot / Cabin Crew',
    Doctor = 'Medical Doctor',
    SoftwareEngineer = 'Software Engineer',
    Nurse = 'Nurse',
    Teacher = 'Teacher',
    Scientist = 'Scientist',
    Artist = 'Artist',
    SalesRepresentative = 'Sales Representative',
    CustomerService = 'Customer Service Representative',
    MarketingManager = 'Marketing Manager',
    DataScientist = 'Data Scientist',
    AISpecialist = 'AI/Machine Learning Specialist',
}

export enum PersonalityTrait {
    Supportive = 'Supportive',
    Sarcastic = 'Sarcastic',
    Playful = 'Playful',
    Serious = 'Serious',
    Introverted = 'Introverted',
    Extroverted = 'Extroverted',
    Creative = 'Creative',
    Analytical = 'Analytical',
    Optimistic = 'Optimistic',
    Pessimistic = 'Pessimistic',
    Pragmatic = 'Pragmatic',
    Idealistic = 'Idealistic',
    Spontaneous = 'Spontaneous',
    Methodical = 'Methodical',
    Humorous = 'Humorous',
    Philosophical = 'Philosophical',
    Nurturing = 'Nurturing',
    Competitive = 'Competitive',
}

// ADDED: New enum for vocal speaking styles
export enum SpeakingStyle {
    Expressive = 'Expressive',
    Calm = 'Calm',
    Formal = 'Formal',
    Cheerful = 'Cheerful',
    Whispering = 'Whispering',
    Serious = 'Serious',
}

export enum VoiceType {
    Prebuilt = 'prebuilt',
    Custom = 'custom',
}

export interface AgentProfile {
    id: string;
    name: string;
    gender: Gender;
    emotion: Emotion;
    profession: Profession;
    age: number;
    personalityTraits: PersonalityTrait[];
    avatarUrl?: string;
    voiceType?: VoiceType;
    voiceName?: string;
    speakingStyle?: SpeakingStyle; // ADDED: speakingStyle property
    customVoiceUrl?: string; // ADDED: customVoiceUrl property for vocal identity
}

export interface MessageAuthor {
    id: string;
    name: string;
    profile?: AgentProfile;
    avatarUrl?: string;
}

export interface ChatMessage {
    author: MessageAuthor;
    text: string;
    timestamp: string;
}

export interface Transcript {
    author: 'You' | 'Agent';
    text: string;
}

export interface UserProfile {
    name: string;
    bio: string;
    avatarUrl?: string;
}