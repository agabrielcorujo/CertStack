class Flashcard:
    def __init__(self, front, back):
        self.front = front
        self.back = back

    def __str__(self):
        return f"Card: {self.front}"s