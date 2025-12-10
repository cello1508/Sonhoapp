import { Hand, ScanFace, Bell, Wind, Brain, MapPin, Video, PlayCircle, Image, Star, BookOpen, Anchor, Zap, Repeat, Info } from 'lucide-react';

export type TaskType = 'action' | 'question' | 'info' | 'voice-practice';

export interface LucidityTask {
    id: string;
    title: string;
    description: string;
    category: 'morning' | 'day' | 'night';
    xp: number;
    icon: any;
    type: TaskType;
    questionOptions?: string[]; // For 'question' type
    correctAnswer?: string; // Optional, if there's a right answer
    infoContent?: string; // For 'info' type
    targetPhrase?: string; // For 'voice-practice'
    requiredRepetitions?: number; // For 'voice-practice'
}

export const LUCIDITY_TASKS: LucidityTask[] = [
    // --- Perguntas de Check-in (Perguntas) ---
    {
        id: 'dream_recall_check',
        title: 'Recall Onírico',
        description: 'Você lembra de algum sonho hoje?',
        category: 'morning',
        xp: 5,
        icon: Brain,
        type: 'question',
        questionOptions: ['Sim, com detalhes', 'Vagos fragmentos', 'Não lembro nada']
    },
    {
        id: 'mood_check',
        title: 'Check de Humor',
        description: 'Como você está se sentindo agora?',
        category: 'morning',
        xp: 5,
        icon: ScanFace,
        type: 'question',
        questionOptions: ['Energizado', 'Calmo', 'Cansado', 'Ansioso']
    },
    {
        id: 'dream_journal_entry',
        title: 'Registrar Sonho',
        description: 'Você anotou os detalhes do seu sonho no Diário hoje?',
        category: 'morning',
        xp: 20,
        icon: BookOpen,
        type: 'action'
    },

    // --- Hábito e Questionamento (Dia) ---
    {
        id: 'rc_hands',
        title: 'Check de Realidade: Mãos',
        description: 'Olhe para as mãos por 3 segundos. Conte os dedos. Tente atravessar a palma com o indicador.',
        category: 'day',
        xp: 15,
        icon: Hand,
        type: 'action'
    },
    {
        id: 'magic_text',
        title: 'Texto Mágico',
        description: 'Leia uma frase qualquer ao seu redor. Desvie o olhar. Leia de novo. Mudou?',
        category: 'day',
        xp: 15,
        icon: BookOpen,
        type: 'action'
    },
    {
        id: 'mirror_check',
        title: 'Espelho da Realidade',
        description: 'Vá até um espelho. Olhe nos seus olhos e pergunte sinceramente: "Estou sonhando?"',
        category: 'day',
        xp: 15,
        icon: ScanFace,
        type: 'action'
    },
    {
        id: 'strangeness_trigger',
        title: 'Gatilho de Estranhamento',
        description: 'Observe o ambiente. Há algo fora do lugar? Uma cor estranha? Uma física errada?',
        category: 'day',
        xp: 15,
        icon: Bell,
        type: 'action'
    },
    {
        id: 'breathing',
        title: 'Respiração Consciente',
        description: 'Pare tudo. Faça 3 respirações profundas (4s inspira, 4s segura, 4s solta). Sinta o "agora".',
        category: 'day',
        xp: 10,
        icon: Wind,
        type: 'action'
    },
    {
        id: 'dream_codes',
        title: 'Códigos do Sonho',
        description: 'Pense no seu "Sinal de Sonho" mais comum (ex: água, voar). Procure por ele agora.',
        category: 'day',
        xp: 20,
        icon: MapPin,
        type: 'action'
    },
    {
        id: 'micro_viz',
        title: 'Microvisualização',
        description: 'Feche os olhos por 10s. Imagine vividamente que você está voando agora.',
        category: 'day',
        xp: 15,
        icon: Video,
        type: 'action'
    },

    // --- Pílulas de Conhecimento (Info) ---
    {
        id: 'info_mild',
        title: 'Técnica MILD',
        description: 'MILD significa Indução Mnemônica de Sonhos Lúcidos.',
        category: 'day',
        xp: 5,
        icon: Info,
        type: 'info',
        infoContent: 'A chave para o MILD é a memória prospectiva: lembrar de fazer algo no futuro. Ao treinar isso, você treina seu cérebro para lembrar de ficar lúcido.'
    },
    {
        id: 'info_rem',
        title: 'Ciclo REM',
        description: 'Os sonhos mais vívidos acontecem no sono REM.',
        category: 'day',
        xp: 5,
        icon: Info,
        type: 'info',
        infoContent: 'O sono REM acontece em ciclos de 90 minutos. Os períodos finais da manhã são os mais longos, durando até 45 minutos. É a "Zona de Ouro" para lucidez.'
    },

    // --- Antes de Dormir (Noite) ---
    {
        id: 'memory_training',
        title: 'Treino de Memória',
        description: 'Tente lembrar 3 coisas estranhas que aconteceram ontem.',
        category: 'night',
        xp: 15,
        icon: Brain,
        type: 'question',
        questionOptions: ['Lembrei de tudo', 'Lembrei de algo', 'Não lembrei']
    },
    {
        id: 'mild_ritual',
        title: 'Mantra MILD',
        description: 'Repita em voz alta e com intenção:',
        category: 'night',
        xp: 30,
        icon: Repeat,
        type: 'voice-practice',
        targetPhrase: "Na próxima vez que eu sonhar, vou lembrar que estou sonhando",
        requiredRepetitions: 5
    },
    {
        id: 'scene_entry',
        title: 'Cena de Entrada',
        description: 'Escolha um cenário para o sonho desta noite. Visualize os detalhes sensoriais.',
        category: 'night',
        xp: 20,
        icon: Image,
        type: 'action'
    },
    {
        id: 'zero_screen',
        title: 'Tela Zero',
        description: 'Você evitou telas nos últimos 30 minutos?',
        category: 'night',
        xp: 30,
        icon: Star,
        type: 'question',
        questionOptions: ['Sim, tela zero!', 'Tentei, mas falhei', 'Não']
    },
    {
        id: 'lucidity_anchor',
        title: 'Âncora de Lucidez',
        description: 'Olhe para sua âncora (anel/mãos) agora. Defina a intenção de vê-la no sonho.',
        category: 'night',
        xp: 10,
        icon: Anchor,
        type: 'action'
    },

    // --- Madrugada (Avançado) ---
    {
        id: 'wbtb_lite',
        title: 'WBTB Lite',
        description: 'Acordou de madrugada? Fique 5 min acordado lendo sobre sonhos, depois volte a dormir.',
        category: 'night',
        xp: 50,
        icon: Zap,
        type: 'action'
    },
    {
        id: 'reentry',
        title: 'Reentrada (DEILD)',
        description: 'Se acordar, não se mexa! Tente visualizar o último sonho imediatamente.',
        category: 'night',
        xp: 40,
        icon: PlayCircle,
        type: 'action'
    }
];
