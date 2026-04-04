import { Metadata } from "next";

const articlesMeta = {
    "champ-scientifique-multidisciplinaire": {
        title: "L’entrepreneuriat : un champ scientifique multidisciplinaire",
        author: "Équipe HEC Entrepreneurs",
        readTime: "8 min",
    },
    "importance-echec": {
        title: "L'importance de l'échec dans le parcours entrepreneurial",
        author: "Équipe HEC Entrepreneurs",
        readTime: "5 min",
    },
    "valider-idee-budget-zero": {
        title: "Comment valider votre idée de startup avec un budget zéro",
        author: "Coach Innovation",
        readTime: "7 min",
    },
    "networking-moteur-projet": {
        title: "Le networking : le moteur invisible de votre projet",
        author: "Alumni Club HEC",
        readTime: "4 min",
    },
    "modele-des-3e": {
        title: "Le modèle des 3E en entrepreneuriat",
        author: "Équipe HEC Entrepreneurs",
        readTime: "6 min",
    }
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    const slug = params.slug;
    const meta = articlesMeta[slug as keyof typeof articlesMeta];

    if (!meta) {
        return { title: 'Article non trouvé' };
    }

    const title = `${meta.title} | HEC Entrepreneurs`;
    const description = `Un article par ${meta.author}. Temps de lecture : ${meta.readTime}`;
    // Link previews default strictly to .png or .jpg images
    const imageUrl = `/images/${slug}-preview.png`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: meta.title,
                }
            ]
        }
    }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
