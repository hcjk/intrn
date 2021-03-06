/**
 * Written by Jake Billings 2017
 *
 * Despite Henry's misleading commit history
 */
angular.module('intrn')
    .directive('intrnInternshipView', function () {
        return {
            templateUrl: 'templates/Views/Internship/Internship.html',
            controller: ['$scope', '$q', '$routeParams', '$location', '$uibModal', 'Auth', 'Actions', 'Job', 'Blob', 'Enums', 'Error',
                function ($scope, $q, $routeParams, $location, $uibModal, Auth, Actions, Job, Blob, Enums, Error) {
                    $scope.load = function () {
                        var promises = [];

                        $scope.creatingNew = $routeParams.job_id === 'new';

                        if (!$scope.creatingNew) {
                            promises.concat([
                                Job.get({job_id: $routeParams.job_id}, function (a) {
                                    $scope.internship = a;
                                }).$promise,
                                Blob.resource.queryJobs({job_id: $routeParams.job_id}, function (a) {
                                    console.log(a);
                                    $scope.blob = a[0];
                                }).$promise
                            ]);
                        }
                        $q.all(promises.concat([
                            Enums.get(function (a) {
                                $scope.enums = a;
                            }).$promise
                        ])).then(function () {
                            if (!$scope.internship) $scope.internship = {};
                        }, Error.handle);
                    };

                    $scope.setProperty = function (a, b) {
                        $scope.internship[b] = a;
                    };

                    $scope.saveJob = function () {
                        $scope.internship.company = $routeParams.company_id;
                        if ($scope.creatingNew) {
                            return $uibModal.open({
                                animation: true,
                                template: '<intrn-internship-confirm-modal intrn-cancel="cancel()" intrn-close="close()"></intrn-internship-confirm-modal>',
                                controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, scope) {
                                    scope.close = function () {
                                        $uibModalInstance.close();
                                        saveInternship();
                                    };
                                    scope.cancel = function () {
                                        $uibModalInstance.dismiss();
                                    };
                                }]
                            });
                        }
                    };

                    $scope.upload = function () {
                        return Blob.uploadBase64Url($scope.uri, {
                            user: Auth.getTokenPayload().user,
                            filename: $scope.file.name,
                            job: $scope.internship._id || $scope.internship
                        }).then(function () {
                        }, Error.handle);
                    };

                    $scope.onSelect = function (file) {
                        $scope.file = file;
                    };

                    $scope.onLoad = function (uri) {
                        $scope.uri = uri;
                    };

                    var saveInternship = function () {
                        return Job.save($scope.internship, function (a) {
                            $scope.internship = a;
                            $scope.upload();
                            $location.path('/companies/' + $routeParams.company_id + '/internships/' + a._id);
                        }, Error.handle);
                    };

                    $scope.load();
                }]
        };
    });