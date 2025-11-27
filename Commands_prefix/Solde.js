const { EmbedBuilder} = require('discord.js');
const { getServerDB } = require('./DataBase');

module.exports = {
    name: 'solde',
    description: 'Affiche la monnaie du joeur',

    async execute(message) {
        try {
            
            const user = message.mentions.users.first() || message.author;
            const db = getServerDB(message.guild.id);
            

            // S'assure que la ligne existe, sinon l'insère avec 0
            db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(user.id);
            // Récupère le solde, force à 0 si null ou undefined
            let row = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(user.id);
            let balance = (row && row.banque != null) ? row.banque : 0;

            const embed = new EmbedBuilder()
                .setColor(0x808080)
                //.setTitle(`Information sur la monnaie **¥**`)
                .addFields(
                {
                    name: "",
                    value: `**${balance}¥** dans son solde`,
                    inline: true
                })
            
            await message.channel.send({ embeds: [embed] });
            console.log(`Dans #${message.guild.name} **${user.username}** a ${balance}¥ en sa possession`);

        } catch (err) {
            console.error("Erreur dans $yeninfo :",err);
            await message.channel.send("Impossible d'afficher ton solde actuel");
        }
    }
};