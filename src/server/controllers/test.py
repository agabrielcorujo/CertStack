from example_controller import initialize_config, Similarity_Search
import os
import getpass

def main():
    initialize_config()
    print(Similarity_Search("A user uses AWS for an hour and 20 minutes?"))

if __name__ == "__main__":
    main()