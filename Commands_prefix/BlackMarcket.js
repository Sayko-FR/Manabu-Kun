const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed} = require('discord.js');

module.exports = {
    name: 'blackmarket',
    aliases: ['bm'],
    description: "Affiche le marché noir de Manabu",

    async execute(message) {
        const bonus = new EmbedBuilder()
            .setAuthor({
                name: `BLACK MARKET`,
                iconURL: message.client.user.displayAvatarURL() 
            })
            .setColor(0x00CFFF)
            .addFields({
                name: "",
                value: `💎 **BONUS :**\n` +
                `- **Oeil du banquier (15 000¥) :** Connaît le rôle de 2 personnes ayant déjà figuré dans le classement.\n` +
                `- **Contrat de sang (13 000¥) :** Force un joueur du classement précédant l'achat a révéler son rôle à la personne.\n` +
                `- **Balance de la Lune (11 000¥) :** Connaît le nombre de loups restants (ou de Solos dans le cas d'un Loup).\n` +
                `- **Poids de l'Or (10 000¥) :** Ton vote compte double pendant 3 tours.\n` +
                `- **La Voix du Silence (3 000¥) :** Connaît le rôle d'un joueur aléatoire qui n'a pas voté le condamné.`,
                inline: true
            })

        const malus = new EmbedBuilder()
            .setAuthor({
                name: `BLACK MARKET`,
                iconURL: message.client.user.displayAvatarURL() 
            })
            .setColor(0xFF0000)
            .addFields({
                name: "",
                value: `💀 **MALUS :**\n` +
                `- **La Main du Créancier (4 000¥) :** Le premier du classement perd 50% de son solde. (réutilisable après 1T et 1N)\n` +
                `- **Silence Forcé (5 000¥) :** Annule le vote de 2 joueurs, aléatoirement, parmis ceux qui ont voté le condamné.\n` +
                `- **Poids Mort (4 500¥) :** Applique un malus de 2 votes au joueur chosit. (réutilisable apres 1T et 1N)`,
                inline: true
            })

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('bonus')
                .setLabel('Bonus')
                .setEmoji('💎')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId('malus')
                .setLabel('Malus')
                .setEmoji('💀')
                .setStyle(ButtonStyle.Secondary)
        );

        // Envoie de l'embed + boutons
        const sent = await message.channel.send({embeds: [bonus], components: [row]});

        // Collecteur pour gérer les clics
        const filter = (interaction) => interaction.isButton() && interaction.user.id === message.author.id;
        const collector = sent.createMessageComponentCollector({filter, time: 60000});

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'bonus') {
                await interaction.update({embeds: [bonus]});
            } else if (interaction.customId === 'malus') {
                await interaction.update(({embeds: [malus]}));
            }
        });
    }
};