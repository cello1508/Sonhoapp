import { Hand, ScanFace, Bell, Wind, Brain, MapPin, Video, PlayCircle, Image, Star, BookOpen, Anchor, Zap, Repeat } from 'lucide-react';

export interface LucidityTask {
    id: string;
    title: string;
    description: string;
    category: 'morning' | 'day' | 'night';
    xp: number;
    icon: any;
}

export const LUCIDITY_TASKS: LucidityTask[] = [
    // --- Hábito e Questionamento (Dia) ---
    {
        id: 'rc_hands',
        title: 'Check de Realidade — Mãos',
        description: 'Olhe para as mãos por 3 segundos, conte os dedos e tente atravessar a palma.',
        category: 'day',
        xp: 10,
        icon: Hand
    },
    {
        id: 'magic_text',
        title: 'Texto Mágico',
        description: 'Leia algo, desvie o olhar e leia de novo. Se mudar, é sonho.',
        category: 'day',
        xp: 10,
        icon: BookOpen
    },
    {
        id: 'mirror_check',
        title: 'Espelho da Realidade',
        description: 'Olhe no espelho e foque nos olhos. Pergunte: "Estou sonhando?"',
        category: 'day',
        xp: 10,
        icon: ScanFace
    },
    {
        id: 'strangeness_trigger',
        title: 'Gatilho de Estranhamento',
        description: 'Algo estranho aconteceu? Pare e faça um teste de realidade.',
        category: 'day',
        xp: 15,
        icon: Bell
    },
    {
        id: 'breathing',
        title: 'Respiração de Consciência',
        description: '1 min de respiração 4-4-4-4 para aumentar clareza.',
        category: 'day',
        xp: 10,
        icon: Wind
    },
    {
        id: 'dream_codes',
        title: 'Códigos do Sonho',
        description: 'Identifique um padrão recorrente dos seus sonhos (ex: água, atraso).',
        category: 'day',
        xp: 20,
        icon: MapPin
    },
    {
        id: 'micro_viz',
        title: 'Microvisualização',
        description: 'Feche os olhos por 20s e imagine-se lucido em um sonho.',
        category: 'day',
        xp: 15,
        icon: Video
    },

    // --- Antes de Dormir (Noite) ---
    {
        id: 'memory_training',
        title: 'Treino de Memória',
        description: 'Tente lembrar 3 coisas estranhas de ontem. Reforça o músculo da memória.',
        category: 'night',
        xp: 15,
        icon: Brain
    },
    {
        id: 'mild_ritual',
        title: 'Ritual MILD',
        description: 'Repita 5x com intenção: "Vou perceber que estou sonhando".',
        category: 'night',
        xp: 20,
        icon: Repeat
    },
    {
        id: 'scene_entry',
        title: 'Cena de Entrada',
        description: 'Visualize onde quer acordar no sonho com todos os sentidos.',
        category: 'night',
        xp: 20,
        icon: Image
    },
    {
        id: 'zero_screen',
        title: 'Tela Zero',
        description: 'Sem telas 60 min antes de dormir.',
        category: 'night',
        xp: 30,
        icon: Star
    },
    {
        id: 'guided_journal',
        title: 'Diário Guiado (Pré-Sono)',
        description: 'Responda onde estava, com quem e o que houve de estranho.',
        category: 'night',
        xp: 15,
        icon: BookOpen
    },
    {
        id: 'lucidity_anchor',
        title: 'Âncora de Lucidez',
        description: 'Olhe para sua "âncora" (anel, mãos) antes de fechar os olhos.',
        category: 'night',
        xp: 10,
        icon: Anchor
    },

    // --- Madrugada (Avançado) ---
    {
        id: 'wbtb_lite',
        title: 'WBTB Lite',
        description: 'Acordou após ~5h? Afirme sua intenção e volte a dormir.',
        category: 'night',
        xp: 50,
        icon: Zap
    },
    {
        id: 'reentry',
        title: 'Reentrada no Sonho',
        description: 'Acordou de um sonho? Não se mexa e tente voltar para ele.',
        category: 'night',
        xp: 40,
        icon: PlayCircle
    }
];
