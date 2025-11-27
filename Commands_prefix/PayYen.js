const {getServerDB} = require('./DataBase');
const { aliases } = require('./GetYen');

module.exports = {
    name: 'pay',
    description: "Le joueur pay X yen",

    async execute(message, args) {
        const db = getServerDB(message.guild.id);
        const sender = message.author;
        const quantity = parseInt(args[1]);
        const receiver = message.mentions.users.last();

        // Verification de la quantité
        if(!quantity || isNaN(quantity) || quantity <= 0) {
            return message.channel.send("Veuillez indiquer une quantité valide de yens (¥) à payer.");
        }
        
        // S'assure que la ligne existe, sinon l'insère avec 0
        db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(sender.id);
        db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(receiver.id);

        // Récupère le solde, force à 0 si null ou undefined
        let row = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(sender.id);
        let balance = (row && row.banque != null) ? row.banque : 0;
        console.log(`[PayYen] Avant paiement : banque de ${sender.username} = ${balance}`);

        // Verification du solde
        const senderRow = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(sender.id);
        if (!senderRow || senderRow.banque < quantity) {
            return message.channel.send("Vous n'avez pas assez de yens (¥) pour effectuer ce paiement.");
        }

        // Effectue le paiement
        db.prepare("UPDATE banques SET banque = banque - ? WHERE user_id = ?").run(quantity, sender.id);
        db.prepare("UPDATE banques SET banque = banque + ? WHERE user_id = ?").run(quantity, receiver.id);

        // Lecture après modification
        const updated = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(sender.id);
        const solde = (updated && updated.banque != null) ? updated.banque : 0;
        console.log(`[PayYen] Après paiement : banque de ${sender.username} = ${solde}`)

        return message.channel.send(
            `**${sender.username}** a payé **${quantity}¥** à **${receiver.tag}**.`
        );

    }
};
