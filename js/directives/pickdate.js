app.directive("datatime", function() {
    return {
        restrict: 'E',
        scope: {
            //коллбэк добавления нового элемента
            pickDateController: '=',
            closeDateModal: "=",
            minOrderHours: "=",
            saunaId: "=",
            getHourByCurrentDaySauna: "="
        },
        link: function($scope, element, attrs) {
            $scope.toMonth = function(intMonth){
                var arMonthName = [
                    "Январь", "Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
                ];
                return arMonthName[intMonth];
            };

            $scope.pickerDateTime = {
                y:0,
                m:0,
                d:0,
                hs:0,
                he:0,
                offset:0,
                month: [

                ]
            };

            $scope.current_year = new Date().getFullYear();

            $scope.current_month = new Date().getMonth();

            $scope.current ={
                d : new Date().getDate(),
                m : new Date().getMonth(),
                y : new Date().getFullYear()
            };

            $scope.month = function(direction) {

                var todayDate = new Date();
                var today_day = todayDate.getMonth();
                var today_year = todayDate.getFullYear();

                // Логика меньше текущего месяца незя.
                // console.log(today_day, $scope.current_month);
                // console.log(today_year, $scope.current_year);
                if( today_year < $scope.current_year) {
                    return false;
                }
                if( today_year ===  $scope.current_year){
                    if(today_day > $scope.current_month + direction)  {
                        return false;
                    }
                }

                $scope.current_month = $scope.current_month + direction;

                if($scope.current_month > 11) {
                    $scope.current_year++;
                    $scope.current_month = 0;
                }
                if($scope.current_month < 0) {
                    $scope.current_year--;
                    $scope.current_month = 11;
                }
                $scope.getDays($scope.current_year, $scope.current_month );
                $scope.pickerDateTime.y = $scope.current_year;
                $scope.pickerDateTime.m = $scope.current_month + 1;
            };

            $scope.getDays = function(y, m) {
                var days = [];
                var days_in_month = 32 - new Date(y, m, 32).getDate();
                var date = new Date(y, m,1);
                var day = date.getDay();

                if (day === 0) { // день 0 становится 7
                    day = 7;
                }

                day = day -2;
                for(var i = 0;i <= (day + days_in_month); i++) {
                    if(i <= day ) {
                        days[i] = {
                            weekend:false
                        };
                    } else {
                        var md = (i - day);
                        var wd = new Date(y, m, md).getDay();
                        if (wd === 0) { // день 0 становится 7
                            wd = 7;
                        }
                        days[i] = {
                            num: md,
                            weekend: (wd <= 5) ? false:true
                        };
                    }

                    // Метка селекта
                    if($scope.current.d === days[i].num
                        && $scope.current.m === $scope.current_month
                        && $scope.current.y === $scope.current_year ) {
                        days[i].selected = true;
                    } else {
                        days[i].selected = false;
                    }

                    // Сегодня, и прошлое
                    var todayDate = new Date();
                    var today_month = todayDate.getMonth();
                    var today_year = todayDate.getFullYear();
                    var today_date = todayDate.getDate();

                    if(today_year === $scope.current_year &&  today_month === $scope.current_month) {
                        if(today_date ===  days[i].num) {
                            days[i].istoday = true;
                        }
                        if(today_date > days[i].num) {
                            days[i].ispast = true;
                        }
                    }

                }
                //console.log(days);
                $scope.pickerDateTime.month = days;
            }

            $scope.getDays( $scope.current_year, $scope.current_month );

            function in_period_time(now, start, end) {
                if(now >= start && now <= end) {
                    return true;
                } else {
                    return false;
                }
            }

            $scope.hours = [];

            $scope.selectDate = function(day) {
                if(!day.ispast) {
                    $scope.hours = [];
                    $scope.current = {
                        d: day.num,
                        m: $scope.current_month,
                        y: $scope.current_year
                    };
                    var nd = $scope.current;
                    $scope.getDays($scope.current_year, $scope.current_month);

                    $scope.getHourByCurrentDaySauna( $scope.current ).then(function (response) {
                       // console.log(response.data);
                        //$scope.pickDateController( $scope.current);

                        for(var i = 0; i < 24; i++) {
                            var now = new Date(nd.y + "-" + (nd.m+1) + "-" + nd.d + " "+$scope.toReadebleHour(i)).getTime()/1000;
                            //console.log(now, i)
                            var h = {
                                t:i,
                            };

                            angular.forEach(response.data, function(value, key) {
                                var order_start = new Date(value.start).getTime()/1000;
                                var order_end = new Date(value.end).getTime()/1000;

                                if(in_period_time(now, order_start, order_end) && !h.busy) {
                                    h.busy = true;
                                }
                            });
                            $scope.hours.push(h);
                        }
                    });
                };
            };

            $scope.click = 0;
            $scope.start_hour = "";
            $scope.end_hour = "";
            $scope.selectHour = function(h) {
                if(h.busy) {
                   return false;
                }

                if(h.current) {
                    h.current = false;
                    $scope.click = 0;
                }

                switch($scope.click){
                    case 0:
                        angular.forEach($scope.hours, function(value, key) {
                            value.current = false;
                            value.special_class = "";
                        });
                        h.current = true;
                        h.special_class = "start";
                        $scope.click = 1;
                        $scope.start_hour = h;
                    break;
                    case 1:
                        h.special_class = "end";
                        h.current = true;
                        $scope.click = 0;
                        $scope.end_hour = h;

                        if($scope.end_hour.t < $scope.start_hour.t) {
                            $scope.end_hour = $scope.start_hour;
                            $scope.start_hour = h;

                            angular.forEach($scope.hours, function(value, key) {
                                if(value.special_class === "start") {
                                    value.special_class = "end";
                                } else {
                                    if (value.special_class === "end") {
                                        value.special_class = "start";
                                    }
                                }
                            });
                        }

                       // console.log($scope.end_hour.t , $scope.start_hour.t , $scope.minOrderHours);
                        if(($scope.end_hour.t - $scope.start_hour.t) < $scope.minOrderHours-1) {
                            alert("Минимальный заказ: "+$scope.minOrderHours+" часа");
                            $scope.start_hour = "";
                            $scope.end_hour = "";
                            angular.forEach($scope.hours, function(value, key) {
                                value.current = false;
                                value.special_class = "";
                            });
                        }
                        var allow = true;
                        angular.forEach($scope.hours, function(value, key) {
                            if(value.t > $scope.start_hour.t && value.t < $scope.end_hour.t && allow) {
                                value.current = true;
                                value.special_class = "middel";
                                if(value.busy) {
                                    alert("В выбраном диапозоне иеется резерв, выбирите другой временной диапозон.");
                                    allow = false;
                                    $scope.start_hour = "";
                                    $scope.end_hour = "";
                                    angular.forEach($scope.hours, function(value, key) {
                                        value.current = false;
                                        value.special_class = "";
                                    });
                                }
                            }
                        });
                        if(allow) {
                            $scope.current.start_hour = $scope.start_hour;
                            $scope.current.end_hour = $scope.end_hour;
                            $scope.pickDateController( $scope.current);
                        }
                    break;
                }


            };

            $scope.toReadebleHour = function(i) {
                if(i < 10) {
                    i = "0"+i
                }
                return i+":00";
            }

        },
        template: '<div class="date-picker">\n' +
            '            <div class="date">\n' +
            '                <div class="control">\n' +
            '                    <div class="close" ng-click="closeDateModal()"><img src="images/svg/close.svg"></div>\n'+
            '                    <img src="images/svg/arrow-blue-right.svg" class="arrow deg180" ng-click="month(-1)">\n' +
            '                    <div class="now">{{ toMonth(current_month) }} {{ current_year }}</div>\n' +
            '                    <img src="images/svg/arrow-blue-right.svg" class="arrow" ng-click="month(1)">\n' +
            '                </div>\n' +
            '\n' +
            '                <div class="dates">\n' +
            '                    <div class="table">\n' +
            '                        <div class="weeks">\n' +
            '                            <span>пн</span>\n' +
            '                            <span>вт</span>\n' +
            '                            <span>ср</span>\n' +
            '                            <span>чт</span>\n' +
            '                            <span>пт</span>\n' +
            '                            <span class="red">сб</span>\n' +
            '                            <span class="red">вс</span>\n' +
            '                            <span class="day {{ (day.weekend)?\'red\':\'\' }} {{ (day.ispast)?\'past\':\'\' }} {{ day.istoday?\'now\':\'\' }} {{ day.selected?\'selected\':\'\' }}" ng-click="selectDate(day)" ng-repeat="day in pickerDateTime.month">{{day.num}}</span>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="time">\n' +
            '                <div class="header">' +
            '                       Свободное время ' +
            '                   <div class="info">минимальный заказ: {{ minOrderHours }} часа</div>' +
            '                </div>          \n' +
            '                <div class="hours" >' +
            '                   <div class="hour {{hour.busy?\'busy\':\'\'}} {{hour.current?\'current\':\'\'}} {{hour.special_class}}" ng-repeat="hour in hours" ng-click="selectHour(hour)">{{toReadebleHour(hour.t)}}</div>   ' +
            '                </div>'+
            '            </div>\n' +
            '            <span class="today" ng-click="todayView()">Сегодня</span>\n' +
            '        </div>'
    }
});
