const { getServerDB } = require('./DataBase');
const { checkCooldown } = require('./Cooldown');

module.exports = {
    name: 'bet',
    description: "Pari en solo ou contre un autre joueur",

    async execute(message, args) {
        const bettor = message.author;
        const db = getServerDB(message.guild.id);

        // Vérifie que le joueur a mis un montant valide
        let bet = parseInt(args[0]);
        if (!bet || isNaN(bet) || bet <= 0) {
            return message.channel.send("❌ Tu dois indiquer une quantité valide à miser !");
        }

        // Détection du mode
        const opponent = message.mentions.users.last();
        const mode = opponent ? "bet" : "betsolo"; // clé pour cooldownConfig

        // Vérifie le cooldown
        if (!checkCooldown(bettor.id, mode, message)) return;
        if (opponent && !checkCooldown(opponent.id, mode, message)) return; // si duel → cooldown aussi pour l’adversaire

        // Insère les joueurs en DB si besoin
        db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(bettor.id);
        if (opponent) {
            db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(opponent.id);
        }

        // === MODE DUEL ===
        if (opponent) {
            const rowBettor = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(bettor.id);
            const rowOpponent = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(opponent.id);

            if (!rowBettor || rowBettor.banque < bet) {
                return message.channel.send("💸 Tu n'as pas assez de yen pour ce pari !");
            }
            if (!rowOpponent || rowOpponent.banque < bet) {
                return message.channel.send("💸 Le joueur mentionné n'a pas assez de yen pour ce pari !");
            }

            const bettors = [bettor, opponent];
            const winner = bettors[Math.floor(Math.random() * 2)];
            const loser = winner.id === bettor.id ? opponent : bettor;
            const gain = bet * 2;

            db.prepare("UPDATE banques SET banque = banque - ? WHERE user_id = ?").run(bet, bettor.id);
            db.prepare("UPDATE banques SET banque = banque - ? WHERE user_id = ?").run(bet, opponent.id);
            db.prepare("UPDATE banques SET banque = banque + ? WHERE user_id = ?").run(gain, winner.id);

            return message.channel.send(`🎉 ${winner.username} a gagné contre ${loser.username} et remporte ${gain}¥ !`);
        }

        // === MODE SOLO ===
        const row = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(bettor.id);
        if (!row || row.banque < bet) {
            return message.channel.send("Tu n'as pas assez de yen en ta possession !");
        }

        const gainSolo = Math.floor(Math.random() * (bet * 2 + 1)); // 0 → 2× la mise
        const lose = bet * 2;
        const chanceToWin = [gainSolo, lose];
        const result = chanceToWin[Math.floor(Math.random() * 2)];

        if (result === gainSolo) {
            db.prepare("UPDATE banques SET banque = banque - ? + ? WHERE user_id = ?").run(bet, gainSolo, bettor.id);
            return message.channel.send(`🎉 Félicitations ${bettor.username}, tu as gagné ${gainSolo}¥ !`);
        } else {
            db.prepare("UPDATE banques SET banque = banque - ? WHERE user_id = ?").run(lose, bettor.id);
            return message.channel.send(
                `Pas de chance ${bettor.username}, tu viens de perdre ${lose}¥ !\n(Cependant, tu peux retenter ta chance)`
            );
        }
    }
};
