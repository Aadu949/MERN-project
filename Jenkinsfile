pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    }

    stages {
        stage('Build Backend') {
            steps {
                sh 'docker build -t aadu949/mern-server:${BUILD_NUMBER} ./server'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t aadu949/mern-client:${BUILD_NUMBER} ./client'
            }
        }

        stage('Docker Login') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login \
                        -u "$DOCKERHUB_CREDENTIALS_USR" \
                        --password-stdin
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push aadu949/mern-server:${BUILD_NUMBER}
                    docker push aadu949/mern-client:${BUILD_NUMBER}
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    echo "MERN CI pipeline completed successfully."
                    echo "Backend image: aadu949/mern-server:${BUILD_NUMBER}"
                    echo "Frontend image: aadu949/mern-client:${BUILD_NUMBER}"
                    echo "Images pushed to Docker Hub."
                '''
            }
        }
    }

    post {
        success {
            echo 'MERN CI pipeline succeeded!'
        }

        failure {
            echo 'MERN CI pipeline failed. Check the console output.'
        }
    }
}
