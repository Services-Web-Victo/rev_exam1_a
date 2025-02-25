import express from "express";
import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const app = express();
const db = mysql.createPool({
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});
const PORT = process.env.PORT || 3000;

app.delete("/api/pokemons/:id", (req, res) => {    
    const idPokemon = req.params.id;

    // Vérifier si le pokemon existe dans la bd
    db.query('SELECT id, nom, type_primaire, type_secondaire, pv, attaque, defense FROM pokemon WHERE id = ?', [idPokemon], (erreurExiste, resultatExiste) => {
        if (erreurExiste) {
            // Gestion de l'erreur serveur
            console.log(`Erreur sqlState ${erreurExiste.sqlState} : ${erreurExiste.sqlMessage}`);
                    return res.status(500).send({
                        erreur: `Echec lors de la suppression du pokemon id ${idPokemon}.`
                    });
            
        } else {
            if (resultatExiste.length === 0) {
                // Le pokemon n'existe pas dans la bd
                return res.status(404).send({
                    erreur : `Le pokemon id ${idPokemon} n'existe pas dans la base de données.`
                });
            } else {
                // Supprimer le pokemon de la bd
                db.query('DELETE FROM pokemon WHERE id = ?', [idPokemon], (erreur, resultat) => {
                    if (erreur) {
                        // Gestion de l'erreur serveur
                        console.log(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                        return res.status(500).send({
                            erreur: `Echec lors de la suppression du pokemon id ${idPokemon}.`
                        });
                    } else {
                        // Le pokemon a été supprimé
                        res.send({
                            message: `Le pokemon id ${idPokemon} a été supprimé avec succès.`,
                            pokemon: resultatExiste[0]
                        });
                    }
                });
            }
        }        
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});