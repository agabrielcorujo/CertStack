from example_controller import initialize_config, Similarity_Search
import os
import getpass

def main():
    initialize_config()
    print(Similarity_Search("Which AWS team provides paid professional services to help organizations speed up their transition to the cloud?"))

if __name__ == "__main__":
    main()