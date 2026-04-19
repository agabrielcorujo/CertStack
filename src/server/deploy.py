import subprocess

def deploy(dockerfile:str="Dockerfile.server",project:str="certstack"):

    subprocess.run(["fly", "auth", "docker"], check=True)

    try:
        result = subprocess.run(
            [
                "docker",
                "buildx",
                "build",
                "--platform", "linux/amd64",
                "-f", f"../infrastructure/{dockerfile}",
                "-t", f"registry.fly.io/{project}",
                ".",
                "--push"
            ],
            check=True
        )
        
        print("image built, attempting deployment...")

    except Exception as error:
        print(error)

    try:
        subprocess.run(
            [
                "fly",
                "deploy",
                "--image",
                f"registry.fly.io/{project}"
            ],
            check=True
        )

        print("deployment successful")

    except error as e:
        print(e)

if __name__ == "__main__":

    deploy()