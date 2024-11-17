FROM python:3.11.9-bullseye

RUN apt-get update && apt-get upgrade -y

RUN pip install --upgrade pip 


COPY ./tools/requ.txt requirements.txt

RUN pip install -r requirements.txt

RUN mkdir game

WORKDIR /game

COPY ./tools/script.sh /script.sh

RUN chmod +x /script.sh

ENTRYPOINT ["sh", "/script.sh"]

# ENTRYPOINT ["sleep", "infinity"]