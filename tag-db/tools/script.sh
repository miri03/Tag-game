#!bash/ash

python /db/tag_db/manage.py makemigrations
python /db/tag_db/manage.py migrate
cd /db/tag_db
exec "$@"