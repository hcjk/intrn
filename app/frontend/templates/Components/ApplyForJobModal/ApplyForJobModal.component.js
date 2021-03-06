angular.module('intrn')
    .directive('intrnApplyForJobModal', function () {
        return {
            scope: {
                close: '&intrnClose',
                jobId: '@intrnJobIdData',
                applicantId: '@intrnApplicantIdData'
            },
            templateUrl: 'templates/Components/ApplyForJobModal/ApplyForJobModal.html',
            controller: ['$scope', '$q', 'Enums', 'Actions', 'Blob', 'Job', 'Applicant', 'Error', function ($scope, $q, Enums, Actions, Blob, Job, Applicant, Error) {
                var promises = [];

                promises.concat([
                    Enums.get(function (a) {
                        $scope.enums = a;
                        $scope.schools = a.AllSchools;
                    }).$promise,
                    Job.get({job_id: $scope.jobId}, function (a) {
                        $scope.job = a;
                    }).$promise
                ]);

                if ($scope.applicantId) {
                    $scope.isAdmin = true;
                    promises.concat([
                        Applicant.get({applicant_id: $scope.applicantId}, function (a) {
                            $scope.applicant = a;
                        }).$promise,
                        Blob.resource.queryResume({applicant_id: $scope.applicantId}, function (a) {
                            $scope.loadedResume = a[0];
                        }).$promise,
                        Blob.resource.queryChallenge({applicant_id: $scope.applicantId}, function (a) {
                            $scope.loadedChallenge = a[0];
                        }).$promise
                    ]);
                }

                $q.all(promises).then(function () {
                    $scope.promiseComplete = true;
                    //If the applicant does not exist, create one
                    if (!$scope.applicant) $scope.applicant = {job: $scope.jobId};
                }, Error.handle);


                $scope.apply = function () {
                    return Actions.openConfirmModal(
                        'You’ve successfully submitted your application to ' + $scope.job.companyName + '!',
                        null,
                        'edit',
                        'Hurray!',
                        true,
                        function () {
                            Applicant.save($scope.applicant, function (a) {
                                $scope.applicant = a;
                                if (!$scope.loadedResume && !$scope.loadedChallenge) $scope.upload();
                            }, Error.handle);
                        }, function () {
                        });
                };

                //Uploads the necessary files
                $scope.upload = function () {
                    $q.all([
                        Blob.uploadBase64Url($scope.challengeUri, {
                            filename: $scope.challengeFile.name,
                            applicant: $scope.applicant._id || $scope.applicant,
                            applicantFileType: 'challenge',
                            isPublic: true
                        }).$promise,
                        Blob.uploadBase64Url($scope.resumeUri, {
                            filename: $scope.resumeFile.name,
                            applicant: $scope.applicant._id || $scope.applicant,
                            applicantFileType: 'resume',
                            isPublic: true
                        }).$promise
                    ]).then(function () {
                        $scope.close();
                    }, Error.handle);
                };

                $scope.onSelectChallenge = function (file) {
                    $scope.challengeFile = file;
                };

                $scope.onLoadChallenge = function (uri) {
                    $scope.challengeUri = uri;
                };

                $scope.onSelectResume = function (file) {
                    $scope.resumeFile = file;
                };

                $scope.onLoadResume = function (uri) {
                    $scope.resumeUri = uri;
                };
            }]
        }
    });