import random
import Flashcard

class Deck:
    def __init__(self):
        self.cards = []

    def add_card(self, front, back):
        new_card = Flashcard(front, back)
        self.cards.append(new_card)

    def start_quiz(self):
        if not self.cards:
            print("The deck is empty!")
            return

        random.shuffle(self.cards)
        
        score = 0
        for card in self.cards:
            print(f"\nFront: {card.front}")
            user_answer = input("Your answer: ").strip().lower()
            
            if user_answer == card.back.lower():
                print("Correct!")
                score += 1
            else:
                print(f"Incorrect. The answer was: {card.back}")

        print(f"\nQuiz over! Your score: {score}/{len(self.cards)}")