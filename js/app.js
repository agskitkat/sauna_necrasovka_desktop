"use strict";
var url_api = "http://localhost/sauna_api/api.php";
if(!TMPL) {
    var TMPL = "";
}
var app = angular.module("app-sauna", ['slick']);

app.factory('$tablesheet', function($http){
    return {
        get: function(sauna_id, date) {
            return $http({url: url_api, method: "POST", data: {
                    action : 'schedule',
                    method  : 'listOfDate',
                    sauna_id : sauna_id,
                    timestamp_start : date.start,
                    timestamp_end: date.end
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }
    }
});

app.factory('$saunalist', function($http){
    return {
        get: function() {
            return $http({url: url_api, method: "POST", data: {
                    action : 'sauna',
                    method  : 'getList'
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }
    }
});

app.factory('$services', function($http){
    return {
        get: function() {
            return $http({url: url_api, method: "POST", data: {
                    action : 'service',
                    method  : 'getList'
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }
    }
});

app.factory('$store', function($http){
    return {
        get: function() {
            return $http({url: url_api, method: "POST", data: {
                    action : 'store',
                    method  : 'getList'
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }
    }
});

app.factory('$menu', function($http){
    return {
        get: function() {
            return $http({url: url_api, method: "POST", data: {
                    action : 'menu',
                    method  : 'getList'
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }
    }
});

app.controller("pageController", function($scope, $saunalist, $tablesheet, $services, $store, $menu, $http) {
    $scope.view_page = "";
    $scope.view_content = true;
    $scope.view_pages = false;

    $scope.sliderOn = true;

    $scope.sauna_list = [];
    $saunalist.get().then(function (response) {
        angular.forEach(response.data, function(value, key) {
            var sauna = JSON.parse(value.sauna);
            sauna.id = value.id;
            $scope.sauna_list.push(sauna);
        });

        $scope.getFirstSauna();

    });
    $scope.getFirstSauna = function(){
        $scope.sauna_list[0].choose = true;
        $scope.sauna_choose = $scope.sauna_list[0];
    }
    $scope.order = {
        client: {
            name:"",
            phone:""
        },
        sauna: {
            id: 0,
            datetime:{
                start:1,
                stop:1
            },
            guest:1
        },
        service: [],
        store: []
    };


    // SAUNA
    $scope.viewTime = function(dt){
        var start = dt.start;
        var stop = dt.end;

        //console.log(new Date(start).getTime(), new Date(stop).getTime());

        if(!start) {
            return "Дату и время визита";
        }

        if(new Date(stop).getTime() <= new Date(start).getTime()) {
            return "Некорректная дата";
        }

        return $scope.orderDate("date") + " / " + $scope.orderDate("starttime") + " - " +  $scope.orderDate("endtime");
    };
    $scope.booleanChooseSauna = false;
    $scope.showChooseSauna = function () {
        $scope.booleanChooseSauna = true;
    };
    $scope.chooseSauna = function (sauna) {
        $scope.sliderOn = false;
        angular.forEach($scope.sauna_list, function(value, key) {
            value.choose = false;
        });
        sauna.choose = true;
        $scope.sauna_choose = sauna;
        $scope.booleanChooseSauna = false;

        $scope.cleanOrderSauna();

        setTimeout(function(){
            $scope.sliderOn = true;
            $scope.$apply();
        },0);


    };
    $scope.closeChooseSauna = function(){
        $scope.booleanChooseSauna = false;
    };
    $scope.cleanOrderSauna = function() {
        $scope.order.sauna = {
            id: 0,
            datetime:{
                start:0,
                stop:0
            },
            guest:1
        }
    };


    // SAUNA PICK DATE
    $scope.booleanChooseDATE = false;
    $scope.showChooseDATE = function () {
        $scope.booleanChooseDATE = true;
    };
    $scope.chooseDATE = function () {
        $scope.booleanChooseDATE = false;
    };
    $scope.closeChooseDATE = function(){
        $scope.booleanChooseDATE = false;
    };
    $scope.closemodal = function() {
        $scope.booleanChooseDATE = false;
    };
    $scope.pickdate = function(data) {
        var strat = data.y + "-" + (data.m+1) + "-" + data.d + " " + data.start_hour.t + ":00";
        var end = data.y + "-" + (data.m+1) + "-" + data.d + " " + data.end_hour.t + ":00";
        $scope.order.sauna.id = $scope.sauna_choose.id;
        $scope.order.sauna.datetime = {
            start:strat,
            end:end,
            hours: data.end_hour.t - data.start_hour.t
        };
        $scope.order.sauna.current = $scope.sauna_choose;
        //console.log($scope.order.sauna);
    };
    $scope.getOrderTimeOfDateSauna = function(date) {
        //console.log(date);
        var d =  date.y + "-" +(date.m + 1)+ "-" + date.d;
        return $tablesheet.get( $scope.sauna_choose.id, {start: d + " 00:00:00", end: d+" 23:59:59"});
    };
    $scope.orderDate = function(mode) {
        var start = new Date($scope.order.sauna.datetime.start);

        if(mode === "date") {
            return $scope.toReadebleHour(start.getDate()) + "." +$scope.toReadebleHour(start.getMonth()) +"." +start.getFullYear();
        }

        if(mode === "starttime") {
            return $scope.toReadebleHour(start.getHours()) + ":" + $scope.toReadebleHour(start.getMinutes());
        }

        if(mode === "endtime") {
            var end = new Date($scope.order.sauna.datetime.end);
            return $scope.toReadebleHour(end.getHours()) + ":" + $scope.toReadebleHour(end.getMinutes());
        }
    };
    $scope.calcPrice = function() {
        $scope.order.sauna.current = $scope.sauna_choose;
        if($scope.order.sauna.id) {
            var base_price = $scope.order.sauna.current.price;
            var overguest_price = $scope.order.sauna.current.guest_overprice;
            var guest = $scope.order.sauna.guest;
            var max_guest = $scope.order.sauna.current.max_guest;
            base_price = ($scope.order.sauna.datetime.hours+1) * base_price;
            var x = guest - max_guest;
            if (x >= 0) {
                base_price = base_price + (x * overguest_price);
            }
            return base_price;
        } else {
            return 0;
        }
    }



    // ORDER SAUNA CONTROL
    $scope.saunaMansCount = function(derection) {
        if( ($scope.order.sauna.guest + derection)  >= 1) {
            $scope.order.sauna.guest += derection;
        }
    };
    $scope.buttonOrderSauna = function(sauna_choose) {
        $scope.viewMainPage();
    };



    // SERVICE
    $scope.booleanChooseService = false;
    $scope.services = [];
    $scope.service_current = {};
    $services.get().then(function (response) {
        angular.forEach(response.data, function(value, key) {
            var item = JSON.parse(value.json);
            item.id = value.id;
            $scope.services.push(item);
        });
        console.log( $scope.services);
        $scope.services[0].current = true;
        $scope.service_current = $scope.services[0];
    });
    $scope.viewServiceChooser = function(boolean) {
        $scope.booleanChooseService = boolean;
    };
    $scope.getServiceName = function(id){

    };
    $scope.chooseService = function(service) {
        $scope.service_current = service;
        angular.forEach($scope.services, function(value, key) {
            value.current = false;
        });
        $scope.service_current.current = true;
    }
    $scope.calcServicesPrice = function(service) {
        console.log(service);
        var price = 0;
        angular.forEach( service.services, function(value, key) {
            if(value.check) {
                price += parseInt( value.price);
            }
        });
        return price;
    }
    $scope.calcAllServicesPrice = function() {
        var price = 0;
        angular.forEach( $scope.services, function(service, key) {
            price += $scope.calcServicesPrice(service);
        });
        return price;
    }
    $scope.serviceOrder = function () {
        $scope.viewMainPage();
    };


    // STORE
    $scope.sliderOnStore = true;
    $scope.store = [];
    $scope.storeFilterValue = {category: "men"};
    $store.get().then(function (response) {
        angular.forEach(response.data, function(value, key) {
            var item = JSON.parse(value.json);
            item.id = value.id;
            item.count = 0;
            $scope.store.push(item);
        });
        console.log( $scope.store );
    });
    $scope.goodCount = function(good, direction) {
        if(good.count < 1 && direction < 0) {
            return false;
        } else {
            good.count = good.count + direction;
        }
    }
    $scope.storeFilter = function(val) {
        $scope.storeFilterValue.category = val;
        $scope.sliderOnStore = false;
        setTimeout(function(){
            $scope.sliderOnStore = true;
            $scope.$apply();
        },0);
    }
    $scope.orderStore = function() {
        $scope.viewMainPage();
    }
    $scope.calcAllStore = function() {
        var price = 0;
        angular.forEach($scope.store, function(value, key) {
            if(value.count > 0) {
                price = price + value.count * value.price;
            }
        });
        return price;
    }


    // MENU
    $scope.menu = [];
    $menu.get().then(function (response) {
        angular.forEach(response.data, function(value, key) {
            var item = JSON.parse(value.json);
            item.id = value.id;
            $scope.menu.push(item);
        });
        console.log( $scope.menu );
    });


    // PAGES
    $scope.viewPage = function(view_page) {
        $scope.closeMenu();
        $scope.view_page = view_page;
        $scope.view_content = false;
        $scope.view_pages =  true;

        $scope.booleanChooseSauna = false;

        switch(view_page) {
            case "":

                break;
        }
    };
    $scope.viewMainPage = function(view_page) {
        $scope.view_page = "";
        $scope.view_content = true;
        $scope.view_pages =  false;
    };


    // ORDER
    $scope.orderSum  = function() {
        return parseInt($scope.calcPrice()) + parseInt($scope.calcAllServicesPrice())  + parseInt($scope.calcAllStore());
    };
    $scope.orderProcess = function() {
        if($scope.calcPrice() != 0) {
            // Собираем сервисы
            $scope.order.service = [];
            angular.forEach( $scope.services , function(service, key) {
                angular.forEach( service.services, function(value, key) {
                    if(value.check) {
                        $scope.order.service.push(value);
                    }
                });
            });
            // Собираем магазин
            angular.forEach($scope.store, function(value, key) {
                if(value.count > 0) {
                    $scope.order.store.push(value);
                }
            });
            // Показывем окно лида

            $scope.leadForm = true;

        } else {
            alert("Выбирете сауну и дату посещения");
        }
    };
    $scope.leadForm = false;
    $scope.leadFormOK = false;
    $scope.leadFormError = false;
    $scope.errorLeadeFormMsg = false;
    $scope.closeLeadForm = function() {
        $scope.leadForm = false;
        $scope.leadFormOK = false;
    };
    var lock_order = false;
    $scope.sendLeadForm = function() {
        if(!lock_order) {
            lock_order = true;
            console.log($scope.order);
            //$scope.leadFormOK = true;

            if (!$scope.order.client.name) {
                $scope.errorLeadeFormMsg = "Введите имя.";
                console.log("Нет имени");
                lock_order = false;
                return false;
            }

            if ($scope.ValidPhone($scope.order.client.phone)) {
                console.log("Нет нормального телефона");
                $scope.errorLeadeFormMsg = "Введите корректный номер телефона. Пример: 8 123 123 12 23";
                lock_order = false;
                return false;
            }

            $http({url: url_api, method: "POST", data: {
                    action : 'order',
                    method  : 'createOrder',
                    data: $scope.order
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function (response) {
                console.log(response.data);
                if(response.data.code === "ok") {
                    lock_order = false;
                    $scope.leadForm = false;
                    $scope.leadFormOK = true;
                } else {
                    lock_order = false;
                    $scope.leadForm = false;
                    $scope.leadFormOK = false;
                    $scope.leadFormError = true;
                    $scope.leadFormErrorMsg = response.data.msg;
                }
            });
        }
    };

    $scope.closeleadFormError = function() {
        $scope.leadFormError = false;
    }


    // SPECIAL FUNCTION
    $scope.ValidPhone = function(myPhone) {
        var re = /^\+?[\d\s\(\)\-]{4,16}\d$/gm;
        var valid = re.test(myPhone);
        return !valid;
    };

    $scope.currency = function(price) {
        if(!price) {
            return "";
        }
        return price + " руб.";
    };
    $scope.toReadebleHour = function(i) {
        if(i < 10) {
            i = "0"+i
        }
        return i;
    }

    $scope.viewMenu = false;
    $scope.openMenu = function() {
        $scope.viewMenu = true;
    }
    $scope.closeMenu = function() {
        $scope.viewMenu = false;
    }
});