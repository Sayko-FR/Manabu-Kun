const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'helpme',
    description: 'Affiche la liste des commandes',

    async execute(message) {
        try {
            const user = message.author;
            
            const embed1 = new EmbedBuilder()
                .setAuthor({
                    name: `COMMAND LIST`,
                    iconURL: message.client.user.displayAvatarURL() 
                })
                .addFields(
                    {
                        name: "**💴 OBTENTION DES YENS :**",
                        value: `**$getyen** (ou **$gy**) pour optenir un montant journalier de yens
**$bet <quanité>** : Parier une somme d'argent
\u200B
`,
                        inline: false
                    },
                    {
                        name: "**🎮 Jeux multijoueurs :**",
                        value: `**$sticks** : Jeu des 21 bâtons
**$pfc** : Pierre-Feuille-Ciseaux inspiré du Tomodachi Game
**$bet <quantité> @joueur** : Parier avec un autre joueur pour remporter le double de la mise
\u200B
`,
                        inline: false
                    },
                    {
                        name: "🔧 Utilitaires (__JOUEUR__) :",
                        value: `**$solde** : Suivre son solde actuel
**$blackmarket** (ou **$bm**) : Accès à la boutique (marché noir) de la partie
**$pay <quantité>** @joueur : Donner un montant précis à un joueur (ou au GM pour les bonus/malus)
**$helpme** : Affiche l'aide avec toutes les commandes du bot   
\u200B
`,
                        inline: false
                    },
                    {
                        name: "🔧 Utilitaires (__GM__) :",
                        value: `**$leaderboard** : Affiche le classement des joueurs les plus riches
**$removeyen <quantité>** @joueur (ou **$ry**) : Retire une somme d'argent à un joueur
**$addyen <quantité>** @joueur (ou **$ay**) : Ajouter une somme d'argent à un joueur`,
                        inline: false
                    }
                )

                await message.channel.send({ embeds: [embed1]});
        } catch (err) {
            console.error("Erreur dans $helpme :", err);
            await message.channel.send("Impossible d'afficher les informations des commandes");
        }
    }
};