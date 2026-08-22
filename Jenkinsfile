pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        GITHUB_CREDENTIALS = credentials('github-credentials')
    }

    stages {

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=MERN-project \
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

        stage('Update Kubernetes Manifests') {
            steps {
                sh '''
                    git config user.name "Jenkins"
                    git config user.email "jenkins@localhost"

                    sed -i "s|aadu949/mern-server:.*|aadu949/mern-server:${BUILD_NUMBER}|" k8s/backend.yaml
                    sed -i "s|aadu949/mern-client:.*|aadu949/mern-client:${BUILD_NUMBER}|" k8s/frontend.yaml

                    git add k8s/backend.yaml k8s/frontend.yaml

                    git commit -m "Update images to build ${BUILD_NUMBER}" || true
                '''
            }
        }

        stage('Push Kubernetes Changes') {
            steps {
                sh '''
                    git push https://$GITHUB_CREDENTIALS_USR:$GITHUB_CREDENTIALS_PSW@github.com/Aadu949/MERN-project.git HEAD:main
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    echo "MERN CI/CD pipeline completed successfully."
                    echo "Docker images:"
                    echo "aadu949/mern-server:${BUILD_NUMBER}"
                    echo "aadu949/mern-client:${BUILD_NUMBER}"
                    echo "ArgoCD will sync the Kubernetes manifests from GitHub."
                '''
            }
        }
    }

    post {
        success {
            echo 'MERN GitOps CI/CD deployment successful!'
        }

        failure {
            echo 'MERN GitOps deployment failed.'
        }
    }
}
