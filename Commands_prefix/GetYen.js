const {getServerDB} = require('./DataBase');
const { checkCooldown } = require('./Cooldown');

module.exports = {
    name: 'getyen',
    aliases: ['gy'],
    description: "Affiche la monnaie du joueur",

    async execute(message, args) {

        const commandName = this.name;
        if (!checkCooldown(message.author.id, commandName, message)) return;

        const db = getServerDB(message.guild.id);
        const user = message.mentions.users.first() || message.author;
        const quantity = parseInt(args[0]) || 1000;

        // S'assure que la ligne existe, sinon l'insère avec 0
        db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(user.id);
        // Ajoute la quantité au solde existant
        db.prepare("UPDATE banques SET banque = banque + ? WHERE user_id = ?").run(quantity, user.id);

        // Lecture après modification
        const updated = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(user.id);
        const solde = (updated && updated.banque != null) ? updated.banque : 0;
        console.log(`[GetYen] Après ajout : banque = ${solde}`);

        return message.channel.send(
            `+${quantity}¥ ** ${user.username} ** a désormais **${solde}¥** !`
        );
    }
};