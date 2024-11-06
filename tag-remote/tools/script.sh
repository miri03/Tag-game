#!bash/ash

python /game/project/manage.py makemigrations
python /game/project/manage.py migrate
cd /game/project
exec "$@"