const {getServerDB} = require('./DataBase');
const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'leaderboard',
    description: 'Affiche le classement des joueurs en fonction de leur solde de yens',

    async execute(message) {
        try {

            const db = getServerDB(message.guild.id);
            const topPlayers = db.prepare("SELECT user_id, banque FROM banques ORDER BY banque DESC LIMIT 5").all();
            
            if (!topPlayers || topPlayers.length === 0) {
                return message.channel.send("Aucun joueur n'a encore de yens.");
            }

            let description = '';

            for (let i = 0; i < topPlayers.length; i ++) {

                const humans = await message.guild.members.fetch({ user: topPlayers[i].user_id }).catch(() => null);
                if (!humans || humans.user.bot) continue; // Ignore les bots
                
                const userId = topPlayers[i].user_id;
                const yen = topPlayers[i].banque;

                // Pseudo du joueur
                const user = await message.client.users.fetch(userId).catch(() => null);
                const username = user ? user.username : "Utilisateur inconnu";

                // Icône pour les 3 premiers
                let medal = "";
                if (i === 0) medal = "🥇 ";
                else if (i === 1) medal = "🥈 ";
                else if (i === 2) medal = "🥉 ";
                else medal = `#${i + 1} `;

                description += `${medal} **${username}** - ${yen}¥\n`;
            }

            // Récupere l'avatar du premier joueur
            const firstUser = await message.client.users.fetch(topPlayers[0].user_id).catch(() => null);
            const avatarURL = firstUser ? firstUser.displayAvatarURL(): null;
            
            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle(`🏆 **Classement des 5 joueurs les plus riches**`)
                .setDescription(description)

            if (avatarURL) {
                embed.setThumbnail(avatarURL);
            }

            return message.channel.send({ embeds : [embed]});

        } catch (err) {
            console.error("Erreur dans $rankyen :", err);
            await message.channel.send("Impossible d'afficher le classement des yens");
        }
    }
};