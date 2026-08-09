pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    }

    stages {

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=mern-project \
                              -Dsonar.projectName='MERN Project' \
                              -Dsonar.sources=client,server \
                              -Dsonar.exclusions='**/node_modules/**,**/dist/**'
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t aadu949/mern-server:latest ./server'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t aadu949/mern-client:latest ./client'
            }
        }

        stage('Docker Login') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                '''
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
                    docker rm -f mern-server || true
                    docker pull aadu949/mern-server:latest
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
                    docker rm -f mern-client || true
                    docker pull aadu949/mern-client:latest
                    docker run -d \
                      --name mern-client \
                      --restart unless-stopped \
                      -p 80:80 \
                      aadu949/mern-client:latest
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    sleep 5
                    docker ps

                    HOST_IP=$(ip route | awk '/default/ {print $3}')

                    echo "Testing backend through Docker host: $HOST_IP"
                    curl -f http://$HOST_IP:5000

                    echo "Testing frontend through Docker host: $HOST_IP"
                    curl -f http://$HOST_IP
                '''
            }
        }
    }

    post {
        success {
            echo 'MERN CI/CD deployment successful!'
        }

        failure {
            echo 'MERN deployment failed.'
        }
    }
}
