import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Card from "./Card";
import './Deck.css'

const API_URL = "http://deckofcardsapi.com/api/deck";

const Deck = () => {
    const [deck, setDeck] = useState(null)
    const [drawCard, setDrawCard] = useState([]);
    const [autoDraw, setAutoDraw] = useState(false);
    const timerRef = useRef(null);
    

    useEffect(() => {
        async function getData() {
            const resp = await axios.get(`${API_URL}/new/shuffle/`);
            console.log(resp.data)
            setDeck(resp.data)
        }
        getData();
    },[setDeck]);

    useEffect(() => {
        async function getCard() {
            const {deck_id} = deck;

            try {
                const drawRes = await axios.get(`${API_URL}/${deck_id}/draw`);
                
                if (drawRes.data.remaining === 0) {
                    setAutoDraw(false);
                    throw new Error ("no cards remaining!");
                }

                const card = drawRes.data.cards[0];
                
                setDrawCard(draw => [
                    ...draw,
                    {
                        id: card.code,
                        name: card.suit + " " + card.value,
                        image: card.image
                    }
                ])
            } catch (err) {
                alert(err);
            }
        }

        if (autoDraw && !timerRef.current) {
            timerRef.current = setInterval(async () => {
                await getCard();
            }, 1000);
        }

        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [autoDraw, setAutoDraw, deck]);

    const toggleAutoDraw = () => {
        setAutoDraw(auto => !auto);
    };

    const cards = drawCard.map(card => (
        <Card key={card.id} name={card.name} image={card.image} />
    ));

    return (
        <div className="Deck">
           {deck ? (
               <button className="Deck-gimme" onClick={toggleAutoDraw}>
                   {autoDraw ? "STOP" : "KEEP"} DRAWING FOR ME!
               </button>
           ) : null} 
           <div className="Deck-cardarea">{cards}</div>         
        </div>
    )
}

export default Deck;