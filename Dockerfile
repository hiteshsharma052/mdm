FROM python:3.11.10-bookworm
WORKDIR /usr/src/app 
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD python manage.py runserver 0.0.0.0:8000

## added demo commit
EXPOSE 8000
