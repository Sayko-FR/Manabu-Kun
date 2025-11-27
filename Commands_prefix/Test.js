/*const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "player-info",
    descriptio: "Affiche les infos du joueur",

    async execute(message, arg) {
        try {

            const user = message.mentions.users.first() || message.client.users.cache.get(arg[0]);

            if (!user) {
                return message.reply("Merci de mentionner un joueur ou donner son ID.");
            }

            const embed = new EmbedBuilder()
                .setColor(0x808080)
                .setTitle(`Information sur ${user.username}`)
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    {name: "Nom", value: user.tag, inline: true},
                    {name: "ID", value: user.id, inline: true},
                )
                .setTimestamp()

            await message.reply({ embeds: [embed] });

        } catch (err) {
            console.error("Erreur dans $player-info :", err);
            await message.reply("Impossible de cherger les information du joueur");
        }
    }
};*/