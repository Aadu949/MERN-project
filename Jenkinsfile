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
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        def taskId = readFile('.scannerwork/report-task.txt')
                            .readLines()
                            .find { it.startsWith('ceTaskId=') }
                            ?.split('=', 2)
                            ?.getAt(1)

                        if (!taskId) {
                            error('SonarQube task ID not found.')
                        }

                        withCredentials([string(
                            credentialsId: 'sonarqube-token',
                            variable: 'SONAR_TOKEN'
                        )]) {
                            withEnv(["SONAR_TASK_ID=${taskId}"]) {
                                def analysisId = ''
                                waitUntil(initialRecurrencePeriod: 3000) {
                                    def response = sh(
                                        script: '''
                                            curl --fail --silent --show-error -u "$SONAR_TOKEN:" "http://172.17.0.1:9000/api/ce/task?id=$SONAR_TASK_ID"
                                        ''',
                                        returnStdout: true
                                    ).trim()
                                    def task = new groovy.json.JsonSlurperClassic().parseText(response).task
                                    echo "SonarQube analysis status: ${task.status}"
                                    if (task.status in ['FAILED', 'CANCELED']) {
                                        error("SonarQube analysis ${task.status}")
                                    }
                                    if (task.status == 'SUCCESS') {
                                        analysisId = task.analysisId ?: ''
                                        if (!analysisId) {
                                            error('SonarQube analysis ID not found.')
                                        }
                                        return true
                                    }
                                    return false
                                }

                                withEnv(["SONAR_ANALYSIS_ID=${analysisId}"]) {
                                    def gateResponse = sh(
                                        script: '''
                                            curl --fail --silent --show-error -u "$SONAR_TOKEN:" "http://172.17.0.1:9000/api/qualitygates/project_status?analysisId=$SONAR_ANALYSIS_ID"
                                        ''',
                                        returnStdout: true
                                    ).trim()
                                    def gateStatus = new groovy.json.JsonSlurperClassic().parseText(gateResponse).projectStatus.status
                                    echo "SonarQube Quality Gate: ${gateStatus}"
                                    if (gateStatus != 'OK') {
                                        error("Quality Gate failed: ${gateStatus}")
                                    }
                                    echo 'SonarQube Quality Gate PASSED.'
                                }
                            }
                        }
                    }
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

        stage('Deploy') {
            steps {
                sh '''
                    docker run --rm \\
                        -e IMAGE_TAG="${BUILD_NUMBER}" \\
                        -v /var/run/docker.sock:/var/run/docker.sock \\
                        -v /home/ubuntu/MERN-project:/project:ro \\
                        -w /project \\
                        docker:cli sh -c '
                            docker compose -p mern-project pull &&
                            docker compose -p mern-project up -d &&
                            docker compose -p mern-project ps
                        '
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
