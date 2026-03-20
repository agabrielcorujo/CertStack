import os, sys
from langchain_community.vectorstores import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

from services import get_vector_store, get_exam, Similarity_Search

def main():
    store = services.get_vector_store()
    results = store.similarity_search(query, k=k)
    formatted_results = []


    my_deck = Deck()
    
    while True:
        print("\n--- Flashcard Menu ---")
        print("1. Pick Category")
        print("2. Exit")
        choice = input("Select an option: ")

        if choice == '1':
            f = input("Enter the question: ")
            b = input("Enter the answer: ")
            my_deck.add_card(f, b)
        elif choice == '2':
            my_deck.start_quiz()
        elif choice == '3':
            break
        else:
            print("Invalid choice.")

if __name__ == "__main__":
    main()

