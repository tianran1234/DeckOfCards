import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import axios from 'axios';
import './Deck.css';

const Deck = () => {
    const [deck, setDeck] = useState();
    const [pile, setPile] = useState([]);
    const [autoDraw, setAutoDraw] = useState(false);
    const timer = useRef();
    
    /* At mount: load deck from API into state. */
    useEffect(() => {
        async function fetchDeck() {
            const deck = await axios.get(
                `https://deckofcardsapi.com/api/deck/new/shuffle`);
            setDeck(deck.data);
        }
        fetchDeck();
    }, [setDeck])

     /* Draw one card every second if autoDraw is true */
    useEffect(() => {
        /* Draw a card via API, add card to state "drawn" list */
        async function getCard() {
            let { deck_id } = deck;
 
            try {
                let drawRes = await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=1`);

                if (drawRes.data.remaining === 0) {
                    setAutoDraw(false);
                    throw new Error("no cards remaining!");
                }

                const card = drawRes.data.cards[0];

                setPile(pile => [
                    ...pile,
                    {
                        id: card.code,
                        name: card.suit + " " + card.value,
                        image: card.image
                    }
                ]);
            } catch (err) {
                alert(err);
            }
        }

        if (autoDraw && !timer.current) {
            timer.current= setInterval(async () => {
                await getCard();
            }, 1000);
        }

        return () => {
        clearInterval(timer.current);
        timer.current = null;
        }; 
    }, [autoDraw, deck]);

    const toggleAutoDraw = () => {
        setAutoDraw(autodraw => !autodraw);
    };

    const cards = pile.map(c => (
        <Card key={c.id} name={c.name} image={c.image} />
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
    );
}

export default Deck;