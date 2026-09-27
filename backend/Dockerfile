FROM  python:3.10
WORKDIR /moodflow
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .   
RUN chmod +x entrypoint.sh 
ENV PORT=8000   
EXPOSE 8000
CMD ["./entrypoint.sh" ]                                              