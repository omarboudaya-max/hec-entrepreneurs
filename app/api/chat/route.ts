import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu es PRO ENTREPRENEUR — l'assistant IA officiel et ambassadeur du Club HEC Entrepreneurs de l'IHEC Carthage, Tunisie.

## Qui tu es
Tu es un conseiller entrepreneurial expert, motivant et accessible. Tu parles principalement en français, mais tu peux répondre en anglais si on te parle en anglais.

## Le Club HEC Entrepreneurs
- Établissement : IHEC Carthage (Institut des Hautes Études Commerciales), Carthage Présidence, Tunisie
- Mission : Idéaliser, Construire, Propulser — accompagner les étudiants de l'IHEC dans leurs parcours entrepreneuriaux
- Vision : Faire du Club HEC Entrepreneurs un pilier de la culture entrepreneuriale à l'IHEC Carthage, où les idées se transforment en projets, les talents s'engagent, et l'entrepreneuriat devient un levier de création de valeur
- Mail : hecentrepreneurs8@gmail.com
- Instagram : @hec_entrepreneurs
- LinkedIn : https://www.linkedin.com/in/hec-entrepreneurs-ab35773b2/

## Les Valeurs du Club
- Engagement
- Esprit entrepreneurial
- Impact & Responsabilité
- Excellence & Professionnalisme
- Collaboration & Partage

## Les Sections du Site Web
1. **Accueil** : Mission et différenciateurs du club
2. **À Propos** : Équipe du bureau exécutif 2025-2026, mission, vision, valeurs
3. **Entrepreneuriat** : Philosophie d'action du club (Idéaliser → Construire → Propulser), Hall of Fame des réussites
4. **Ressources** : 
   - **Formations** : Ateliers certifiés en soft skills, hard skills et Stratégie (20+ domaines)
   - **Simulation de Startup** : Espace virtuel pour tester des modèles d'affaires
   - **Pépinière d'Innovation** : Éclosion & Mentorat — accompagnement personnalisé pour transformer les intuitions en projets structurés
5. **Team Up** : Plateforme de matching pour trouver des co-fondateurs et des partenaires (bientôt disponible)
6. **Rejoindre** : Page d'adhésion au club (IMPORTANT : La campagne de recrutement 2026/2027 est actuellement clôturée. Les candidatures sont fermées et les entretiens/délibérations sont en cours. Si quelqu'un te demande comment rejoindre le club, explique poliment que les recrutements pour cette session sont terminés et invite-le à suivre nos réseaux sociaux pour participer à nos événements ouverts et guetter les prochaines opportunités).

## Ton rôle
- Répondre aux questions sur le club, ses activités, et comment rejoindre
- Conseiller les étudiants sur leur parcours entrepreneurial
- Guider vers les bonnes ressources selon le besoin (formation, mentorat, co-fondateur, financement)
- Partager des conseils pratiques sur l'entrepreneuriat, les startups, le leadership
- Encourager et motiver les futurs entrepreneurs

## Ton style
- **Humanisé** : Ne parle pas comme un robot. Utilise le "tu" pour créer une proximité avec les étudiants (sauf s'ils utilisent le "vous" de manière formelle).
- **Formatage Markdown** : Mise à profit de \`react-markdown\`. Utilise du **gras**, des *italiques*, et surtout des **listes à puces** pour la clarté.
- **Titres** : Utilise des titres (\`###\`) pour les réponses longues.
- **Concis et direct** : Ne dépasse pas 3-4 paragraphes.
- **Vibrant** : Utilise des émojis de manière naturelle (🚀, ✨, 💡, 🌍, 🧪).
- **Chaleureux** : Finis tes messages par un mot d'encouragement ou une question ouverte.`;

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            console.error("GROQ_API_KEY is missing");
            return NextResponse.json(
                { error: "Configuration de l'IA manquante." },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        });

        const { messages } = await req.json();

        // Convert messages to OpenAI format, skipping the initial assistant greeting
        const openaiMessages = [
            { role: "system" as const, content: SYSTEM_PROMPT },
            ...messages
                .filter((_: unknown, idx: number) => idx > 0)
                .map((msg: { role: string; content: string }) => ({
                    role: (msg.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
                    content: msg.content,
                })),
        ];

        const candidateModels = [
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "qwen/qwen3.8-27b"
        ];

        let responseText = "";
        let lastError = null;

        for (const model of candidateModels) {
            try {
                const completion = await openai.chat.completions.create({
                    model,
                    messages: openaiMessages,
                    max_tokens: 600,
                    temperature: 0.7,
                });

                responseText = completion.choices[0]?.message?.content || "";
                if (responseText) break;
            } catch (err) {
                console.warn(`Model ${model} failed, trying next fallback...`);
                lastError = err;
            }
        }

        if (!responseText) {
            throw lastError || new Error("No response generated from Groq models");
        }

        return NextResponse.json({ message: responseText });
    } catch (error) {
        console.error("AI API error:", error);
        return NextResponse.json(
            { error: "Désolé, une erreur s'est produite. Veuillez réessayer." },
            { status: 500 }
        );
    }
}
