pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    }

    stages {

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t aadu949/mern-server:latest ./server'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t aadu949/mern-client:latest ./client'
            }
        }

        stage('Docker Hub Login') {
            steps {
                sh 'echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin'
            }
        }

        stage('Push Images') {
            steps {
                sh 'docker push aadu949/mern-server:latest'
                sh 'docker push aadu949/mern-client:latest'
            }
        }

        stage('Deploy Backend') {
            steps {
                sh '''
                    docker pull aadu949/mern-server:latest
                    docker rm -f mern-server || true
                    docker run -d \
                      --name mern-server \
                      --env-file /home/ubuntu/MERN-project/server/.env \
                      --restart unless-stopped \
                      -p 5000:5000 \
                      aadu949/mern-server:latest
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    docker pull aadu949/mern-client:latest
                    docker rm -f mern-client || true
                    docker run -d \
                      --name mern-client \
                      --restart unless-stopped \
                      -p 80:80 \
                      aadu949/mern-client:latest
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    sleep 5
                    docker ps
                    curl -f http://localhost:5000
                    curl -f http://localhost
                '''
            }
        }
    }

    post {
        success {
            echo 'MERN application built, pushed and deployed successfully!'
        }

        failure {
            echo 'Deployment failed. Check the console output.'
        }
    }
}
