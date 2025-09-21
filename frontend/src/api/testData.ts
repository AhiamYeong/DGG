// 더미 데이터 주석화
/*
const testRouteData: any = {
    "result": {
        "searchType": 0,
        "outTrafficCheck": 0,
        "busCount": 1,
        "subwayCount": 5,
        "subwayBusCount": 5,
        "pointDistance": 8483,
        "startRadius": 700,
        "endRadius": 700,
        "path": [
            {
                "pathType": 1,
                "info": {
                    "trafficDistance": 14900.0,
                    "totalWalk": 102,
                    "totalTime": 31,
                    "payment": 1650,
                    "busTransitCount": 0,
                    "subwayTransitCount": 3,
                    "mapObj": "2:2:222:226@4:2:433:428@6:2:628:626",
                    "firstStartStation": "강남",
                    "lastEndStation": "공덕",
                    "totalStationCount": 11,
                    "busStationCount": 0,
                    "subwayStationCount": 11,
                    "totalDistance": 15002.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 18
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 3,
                        "sectionTime": 1
                    },
                    {
                        "trafficType": 1,
                        "distance": 5200,
                        "sectionTime": 9,
                        "stationCount": 4,
                        "lane": [
                            {
                                "name": "수도권 2호선",
                                "subwayCode": 2,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "강남",
                        "startX": 127.027618,
                        "startY": 37.497949,
                        "endName": "사당",
                        "endX": 126.981359,
                        "endY": 37.476575,
                        "way": "사당",
                        "wayCode": 2,
                        "door": "6-1",
                        "startID": 222,
                        "endID": 226,
                        "startExitNo": "8",
                        "startExitX": 127.02718636224867,
                        "startExitY": 37.497534149126984,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 222,
                                    "stationName": "강남",
                                    "x": "127.027619",
                                    "y": "37.497952"
                                },
                                {
                                    "index": 1,
                                    "stationID": 223,
                                    "stationName": "교대",
                                    "x": "127.014395",
                                    "y": "37.493902"
                                },
                                {
                                    "index": 2,
                                    "stationID": 224,
                                    "stationName": "서초",
                                    "x": "127.007702",
                                    "y": "37.491852"
                                },
                                {
                                    "index": 3,
                                    "stationID": 225,
                                    "stationName": "방배",
                                    "x": "126.997667",
                                    "y": "37.481496"
                                },
                                {
                                    "index": 4,
                                    "stationID": 226,
                                    "stationName": "사당",
                                    "x": "126.981363",
                                    "y": "37.476575"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 7600,
                        "sectionTime": 14,
                        "stationCount": 5,
                        "lane": [
                            {
                                "name": "수도권 4호선",
                                "subwayCode": 4,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "사당",
                        "startX": 126.981662,
                        "startY": 37.476793,
                        "endName": "삼각지",
                        "endX": 126.97298,
                        "endY": 37.534539,
                        "way": "삼각지",
                        "wayCode": 1,
                        "door": "1-1",
                        "startID": 433,
                        "endID": 428,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 433,
                                    "stationName": "사당",
                                    "x": "126.981668",
                                    "y": "37.476798"
                                },
                                {
                                    "index": 1,
                                    "stationID": 432,
                                    "stationName": "총신대입구(이수)",
                                    "x": "126.982193",
                                    "y": "37.486803"
                                },
                                {
                                    "index": 2,
                                    "stationID": 431,
                                    "stationName": "동작",
                                    "x": "126.980341",
                                    "y": "37.502915"
                                },
                                {
                                    "index": 3,
                                    "stationID": 430,
                                    "stationName": "이촌",
                                    "x": "126.974396",
                                    "y": "37.522427"
                                },
                                {
                                    "index": 4,
                                    "stationID": 429,
                                    "stationName": "신용산",
                                    "x": "126.967948",
                                    "y": "37.529241"
                                },
                                {
                                    "index": 5,
                                    "stationID": 428,
                                    "stationName": "삼각지",
                                    "x": "126.972987",
                                    "y": "37.534547"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 2100,
                        "sectionTime": 6,
                        "stationCount": 2,
                        "lane": [
                            {
                                "name": "수도권 6호선",
                                "subwayCode": 6,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 8,
                        "startName": "삼각지",
                        "startX": 126.974018,
                        "startY": 37.535584,
                        "endName": "공덕",
                        "endX": 126.951968,
                        "endY": 37.543509,
                        "way": "공덕",
                        "wayCode": 1,
                        "door": "null",
                        "startID": 628,
                        "endID": 626,
                        "endExitNo": "1",
                        "endExitX": 126.95049820339278,
                        "endExitY": 37.54396675439449,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 628,
                                    "stationName": "삼각지",
                                    "x": "126.974019",
                                    "y": "37.535592"
                                },
                                {
                                    "index": 1,
                                    "stationID": 627,
                                    "stationName": "효창공원앞",
                                    "x": "126.961437",
                                    "y": "37.539274"
                                },
                                {
                                    "index": 2,
                                    "stationID": 626,
                                    "stationName": "공덕",
                                    "x": "126.951969",
                                    "y": "37.543515"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 99,
                        "sectionTime": 1
                    }
                ]
            },
            {
                "pathType": 2,
                "info": {
                    "trafficDistance": 10057.0,
                    "totalWalk": 327,
                    "totalTime": 37,
                    "payment": 1500,
                    "busTransitCount": 1,
                    "subwayTransitCount": 0,
                    "mapObj": "1273:1:53:70",
                    "firstStartStation": "강남역9번출구",
                    "lastEndStation": "공덕역6번출구",
                    "totalStationCount": 17,
                    "busStationCount": 17,
                    "subwayStationCount": 0,
                    "totalDistance": 10384.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 12
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 98,
                        "sectionTime": 1
                    },
                    {
                        "trafficType": 2,
                        "distance": 10057,
                        "sectionTime": 33,
                        "stationCount": 17,
                        "lane": [
                            {
                                "busNo": "740",
                                "type": 11,
                                "busID": 1273,
                                "busLocalBlID": "100100537",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            }
                        ],
                        "intervalTime": 12,
                        "startName": "강남역9번출구",
                        "startX": 127.026557,
                        "startY": 37.497824,
                        "endName": "공덕역6번출구",
                        "endX": 126.953343,
                        "endY": 37.54308,
                        "startID": 157359,
                        "startStationCityCode": 1000,
                        "startStationProviderCode": 4,
                        "startLocalStationID": "121000091",
                        "startArsID": "22167",
                        "endID": 104140,
                        "endStationCityCode": 1000,
                        "endStationProviderCode": 4,
                        "endLocalStationID": "113000058",
                        "endArsID": "14149",
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 157359,
                                    "stationName": "강남역9번출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000091",
                                    "arsID": "22167",
                                    "x": "127.026557",
                                    "y": "37.497824",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 1,
                                    "stationID": 106001,
                                    "stationName": "서초동진흥아파트",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000092",
                                    "arsID": "22168",
                                    "x": "127.02275",
                                    "y": "37.49663",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 2,
                                    "stationID": 105832,
                                    "stationName": "서초동유원아파트",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000093",
                                    "arsID": "22169",
                                    "x": "127.019596",
                                    "y": "37.495676",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 3,
                                    "stationID": 105710,
                                    "stationName": "지하철2호선교대역4출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000094",
                                    "arsID": "22170",
                                    "x": "127.015811",
                                    "y": "37.494518",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 4,
                                    "stationID": 105373,
                                    "stationName": "교대역10번출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000058",
                                    "arsID": "22134",
                                    "x": "127.012883",
                                    "y": "37.493619",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 5,
                                    "stationID": 166841,
                                    "stationName": "서초역.서울중앙지법등기국",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000059",
                                    "arsID": "22135",
                                    "x": "127.007315",
                                    "y": "37.493086",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 6,
                                    "stationID": 105329,
                                    "stationName": "서울중앙지방검찰청",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000061",
                                    "arsID": "22137",
                                    "x": "127.006501",
                                    "y": "37.494737",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 7,
                                    "stationID": 105288,
                                    "stationName": "서울지방조달청.서울성모병원",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000138",
                                    "arsID": "22214",
                                    "x": "127.004126",
                                    "y": "37.500718",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 8,
                                    "stationID": 195317,
                                    "stationName": "반포한강공원.세빛섬",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000938",
                                    "arsID": "22405",
                                    "x": "126.997765",
                                    "y": "37.512135",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 9,
                                    "stationID": 105058,
                                    "stationName": "한강중학교",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000061",
                                    "arsID": "03155",
                                    "x": "126.992304",
                                    "y": "37.525451",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 10,
                                    "stationID": 105046,
                                    "stationName": "용산구청",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000059",
                                    "arsID": "03153",
                                    "x": "126.991231",
                                    "y": "37.530344",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 11,
                                    "stationID": 104949,
                                    "stationName": "녹사평역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000092",
                                    "arsID": "03186",
                                    "x": "126.985148",
                                    "y": "37.535085",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 12,
                                    "stationID": 104780,
                                    "stationName": "전쟁기념관",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000090",
                                    "arsID": "03184",
                                    "x": "126.976869",
                                    "y": "37.534816",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 13,
                                    "stationID": 111498,
                                    "stationName": "용산꿈나무종합타운.보건분소",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000087",
                                    "arsID": "03181",
                                    "x": "126.964915",
                                    "y": "37.538478",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 14,
                                    "stationID": 111496,
                                    "stationName": "효창공원앞역.이봉창역사울림관",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000085",
                                    "arsID": "03179",
                                    "x": "126.961928",
                                    "y": "37.539272",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 15,
                                    "stationID": 104277,
                                    "stationName": "용마루고개(서울자동차고등학교)",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000083",
                                    "arsID": "03177",
                                    "x": "126.958435",
                                    "y": "37.540683",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 16,
                                    "stationID": 193861,
                                    "stationName": "용마루고개.신공덕삼성아파트",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "113000060",
                                    "arsID": "14151",
                                    "x": "126.955929",
                                    "y": "37.541859",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 17,
                                    "stationID": 104140,
                                    "stationName": "공덕역6번출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "113000058",
                                    "arsID": "14149",
                                    "x": "126.953343",
                                    "y": "37.54308",
                                    "isNonStop": "N"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 229,
                        "sectionTime": 3
                    }
                ]
            },
            {
                "pathType": 1,
                "info": {
                    "trafficDistance": 14520.0,
                    "totalWalk": 269,
                    "totalTime": 30,
                    "payment": 2350,
                    "busTransitCount": 0,
                    "subwayTransitCount": 3,
                    "mapObj": "109:2:1910:1909@204:2:925:915@5:2:526:529",
                    "firstStartStation": "강남",
                    "lastEndStation": "공덕",
                    "totalStationCount": 8,
                    "busStationCount": 0,
                    "subwayStationCount": 8,
                    "totalDistance": 14789.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 19
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 187,
                        "sectionTime": 3
                    },
                    {
                        "trafficType": 1,
                        "distance": 820,
                        "sectionTime": 2,
                        "stationCount": 1,
                        "lane": [
                            {
                                "name": "수도권 신분당선",
                                "subwayCode": 109,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 8,
                        "startName": "강남",
                        "startX": 127.028351,
                        "startY": 37.49637,
                        "endName": "신논현",
                        "endX": 127.024759,
                        "endY": 37.503927,
                        "way": "신논현",
                        "wayCode": 1,
                        "door": "1-2",
                        "startID": 1910,
                        "endID": 1909,
                        "startExitNo": "8",
                        "startExitX": 127.02718636224867,
                        "startExitY": 37.497534149126984,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 1910,
                                    "stationName": "강남",
                                    "x": "127.028358",
                                    "y": "37.496373"
                                },
                                {
                                    "index": 1,
                                    "stationID": 1909,
                                    "stationName": "신논현",
                                    "x": "127.024766",
                                    "y": "37.503932"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 10100,
                        "sectionTime": 16,
                        "stationCount": 4,
                        "lane": [
                            {
                                "name": "수도권 9호선(급행)",
                                "subwayCode": 9,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 6,
                        "startName": "신논현",
                        "startX": 127.024514,
                        "startY": 37.504456,
                        "endName": "여의도",
                        "endX": 126.924024,
                        "endY": 37.521759,
                        "way": "여의도",
                        "wayCode": 2,
                        "door": "3-3",
                        "startID": 925,
                        "endID": 915,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 925,
                                    "stationName": "신논현",
                                    "x": "127.024504",
                                    "y": "37.504454"
                                },
                                {
                                    "index": 1,
                                    "stationID": 923,
                                    "stationName": "고속터미널",
                                    "x": "127.004318",
                                    "y": "37.506003"
                                },
                                {
                                    "index": 2,
                                    "stationID": 920,
                                    "stationName": "동작",
                                    "x": "126.977774",
                                    "y": "37.503133"
                                },
                                {
                                    "index": 3,
                                    "stationID": 917,
                                    "stationName": "노량진",
                                    "x": "126.941064",
                                    "y": "37.513581"
                                },
                                {
                                    "index": 4,
                                    "stationID": 915,
                                    "stationName": "여의도",
                                    "x": "126.924034",
                                    "y": "37.521764"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 3600,
                        "sectionTime": 8,
                        "stationCount": 3,
                        "lane": [
                            {
                                "name": "수도권 5호선",
                                "subwayCode": 5,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "여의도",
                        "startX": 126.924071,
                        "startY": 37.521624,
                        "endName": "공덕",
                        "endX": 126.951455,
                        "endY": 37.544559,
                        "way": "공덕",
                        "wayCode": 2,
                        "door": "null",
                        "startID": 526,
                        "endID": 529,
                        "endExitNo": "1",
                        "endExitX": 126.95049820339278,
                        "endExitY": 37.54396675439449,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 526,
                                    "stationName": "여의도",
                                    "x": "126.924079",
                                    "y": "37.521625"
                                },
                                {
                                    "index": 1,
                                    "stationID": 527,
                                    "stationName": "여의나루",
                                    "x": "126.93301",
                                    "y": "37.527131"
                                },
                                {
                                    "index": 2,
                                    "stationID": 528,
                                    "stationName": "마포",
                                    "x": "126.945799",
                                    "y": "37.539488"
                                },
                                {
                                    "index": 3,
                                    "stationID": 529,
                                    "stationName": "공덕",
                                    "x": "126.951459",
                                    "y": "37.544559"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 82,
                        "sectionTime": 1
                    }
                ]
            },
            {
                "pathType": 1,
                "info": {
                    "trafficDistance": 11300.0,
                    "totalWalk": 872,
                    "totalTime": 40,
                    "payment": 1650,
                    "busTransitCount": 0,
                    "subwayTransitCount": 3,
                    "mapObj": "9:2:925:920@4:2:431:428@6:2:628:626",
                    "firstStartStation": "신논현",
                    "lastEndStation": "공덕",
                    "totalStationCount": 10,
                    "busStationCount": 0,
                    "subwayStationCount": 10,
                    "totalDistance": 12172.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 19
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 773,
                        "sectionTime": 12
                    },
                    {
                        "trafficType": 1,
                        "distance": 4500,
                        "sectionTime": 9,
                        "stationCount": 5,
                        "lane": [
                            {
                                "name": "수도권 9호선",
                                "subwayCode": 9,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 6,
                        "startName": "신논현",
                        "startX": 127.024514,
                        "startY": 37.504456,
                        "endName": "동작",
                        "endX": 126.977765,
                        "endY": 37.503125,
                        "way": "동작",
                        "wayCode": 2,
                        "door": "6-4",
                        "startID": 925,
                        "endID": 920,
                        "startExitNo": "6",
                        "startExitX": 127.02534507225991,
                        "startExitY": 37.50329805352071,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 925,
                                    "stationName": "신논현",
                                    "x": "127.024504",
                                    "y": "37.504454"
                                },
                                {
                                    "index": 1,
                                    "stationID": 924,
                                    "stationName": "사평",
                                    "x": "127.015073",
                                    "y": "37.504381"
                                },
                                {
                                    "index": 2,
                                    "stationID": 923,
                                    "stationName": "고속터미널",
                                    "x": "127.004318",
                                    "y": "37.506003"
                                },
                                {
                                    "index": 3,
                                    "stationID": 922,
                                    "stationName": "신반포",
                                    "x": "126.996033",
                                    "y": "37.503496"
                                },
                                {
                                    "index": 4,
                                    "stationID": 921,
                                    "stationName": "구반포",
                                    "x": "126.987442",
                                    "y": "37.501438"
                                },
                                {
                                    "index": 5,
                                    "stationID": 920,
                                    "stationName": "동작",
                                    "x": "126.977774",
                                    "y": "37.503133"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 4700,
                        "sectionTime": 12,
                        "stationCount": 3,
                        "lane": [
                            {
                                "name": "수도권 4호선",
                                "subwayCode": 4,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "동작",
                        "startX": 126.980335,
                        "startY": 37.502913,
                        "endName": "삼각지",
                        "endX": 126.97298,
                        "endY": 37.534539,
                        "way": "삼각지",
                        "wayCode": 1,
                        "door": "1-1",
                        "startID": 431,
                        "endID": 428,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 431,
                                    "stationName": "동작",
                                    "x": "126.980341",
                                    "y": "37.502915"
                                },
                                {
                                    "index": 1,
                                    "stationID": 430,
                                    "stationName": "이촌",
                                    "x": "126.974396",
                                    "y": "37.522427"
                                },
                                {
                                    "index": 2,
                                    "stationID": 429,
                                    "stationName": "신용산",
                                    "x": "126.967948",
                                    "y": "37.529241"
                                },
                                {
                                    "index": 3,
                                    "stationID": 428,
                                    "stationName": "삼각지",
                                    "x": "126.972987",
                                    "y": "37.534547"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 2100,
                        "sectionTime": 6,
                        "stationCount": 2,
                        "lane": [
                            {
                                "name": "수도권 6호선",
                                "subwayCode": 6,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 8,
                        "startName": "삼각지",
                        "startX": 126.974018,
                        "startY": 37.535584,
                        "endName": "공덕",
                        "endX": 126.951968,
                        "endY": 37.543509,
                        "way": "공덕",
                        "wayCode": 1,
                        "door": "null",
                        "startID": 628,
                        "endID": 626,
                        "endExitNo": "1",
                        "endExitX": 126.95049820339278,
                        "endExitY": 37.54396675439449,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 628,
                                    "stationName": "삼각지",
                                    "x": "126.974019",
                                    "y": "37.535592"
                                },
                                {
                                    "index": 1,
                                    "stationID": 627,
                                    "stationName": "효창공원앞",
                                    "x": "126.961437",
                                    "y": "37.539274"
                                },
                                {
                                    "index": 2,
                                    "stationID": 626,
                                    "stationName": "공덕",
                                    "x": "126.951969",
                                    "y": "37.543515"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 99,
                        "sectionTime": 1
                    }
                ]
            },
            {
                "pathType": 1,
                "info": {
                    "trafficDistance": 13700.0,
                    "totalWalk": 855,
                    "totalTime": 41,
                    "payment": 1650,
                    "busTransitCount": 0,
                    "subwayTransitCount": 2,
                    "mapObj": "9:2:925:915@5:2:526:529",
                    "firstStartStation": "신논현",
                    "lastEndStation": "공덕",
                    "totalStationCount": 13,
                    "busStationCount": 0,
                    "subwayStationCount": 13,
                    "totalDistance": 14555.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 11
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 773,
                        "sectionTime": 12
                    },
                    {
                        "trafficType": 1,
                        "distance": 10100,
                        "sectionTime": 20,
                        "stationCount": 10,
                        "lane": [
                            {
                                "name": "수도권 9호선",
                                "subwayCode": 9,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 6,
                        "startName": "신논현",
                        "startX": 127.024514,
                        "startY": 37.504456,
                        "endName": "여의도",
                        "endX": 126.924024,
                        "endY": 37.521759,
                        "way": "여의도",
                        "wayCode": 2,
                        "door": "3-3",
                        "startID": 925,
                        "endID": 915,
                        "startExitNo": "6",
                        "startExitX": 127.02534507225991,
                        "startExitY": 37.50329805352071,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 925,
                                    "stationName": "신논현",
                                    "x": "127.024504",
                                    "y": "37.504454"
                                },
                                {
                                    "index": 1,
                                    "stationID": 924,
                                    "stationName": "사평",
                                    "x": "127.015073",
                                    "y": "37.504381"
                                },
                                {
                                    "index": 2,
                                    "stationID": 923,
                                    "stationName": "고속터미널",
                                    "x": "127.004318",
                                    "y": "37.506003"
                                },
                                {
                                    "index": 3,
                                    "stationID": 922,
                                    "stationName": "신반포",
                                    "x": "126.996033",
                                    "y": "37.503496"
                                },
                                {
                                    "index": 4,
                                    "stationID": 921,
                                    "stationName": "구반포",
                                    "x": "126.987442",
                                    "y": "37.501438"
                                },
                                {
                                    "index": 5,
                                    "stationID": 920,
                                    "stationName": "동작",
                                    "x": "126.977774",
                                    "y": "37.503133"
                                },
                                {
                                    "index": 6,
                                    "stationID": 919,
                                    "stationName": "흑석",
                                    "x": "126.963395",
                                    "y": "37.509183"
                                },
                                {
                                    "index": 7,
                                    "stationID": 918,
                                    "stationName": "노들",
                                    "x": "126.953213",
                                    "y": "37.512695"
                                },
                                {
                                    "index": 8,
                                    "stationID": 917,
                                    "stationName": "노량진",
                                    "x": "126.941064",
                                    "y": "37.513581"
                                },
                                {
                                    "index": 9,
                                    "stationID": 916,
                                    "stationName": "샛강",
                                    "x": "126.92889",
                                    "y": "37.516745"
                                },
                                {
                                    "index": 10,
                                    "stationID": 915,
                                    "stationName": "여의도",
                                    "x": "126.924034",
                                    "y": "37.521764"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 3600,
                        "sectionTime": 8,
                        "stationCount": 3,
                        "lane": [
                            {
                                "name": "수도권 5호선",
                                "subwayCode": 5,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "여의도",
                        "startX": 126.924071,
                        "startY": 37.521624,
                        "endName": "공덕",
                        "endX": 126.951455,
                        "endY": 37.544559,
                        "way": "공덕",
                        "wayCode": 2,
                        "door": "null",
                        "startID": 526,
                        "endID": 529,
                        "endExitNo": "1",
                        "endExitX": 126.95049820339278,
                        "endExitY": 37.54396675439449,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 526,
                                    "stationName": "여의도",
                                    "x": "126.924079",
                                    "y": "37.521625"
                                },
                                {
                                    "index": 1,
                                    "stationID": 527,
                                    "stationName": "여의나루",
                                    "x": "126.93301",
                                    "y": "37.527131"
                                },
                                {
                                    "index": 2,
                                    "stationID": 528,
                                    "stationName": "마포",
                                    "x": "126.945799",
                                    "y": "37.539488"
                                },
                                {
                                    "index": 3,
                                    "stationID": 529,
                                    "stationName": "공덕",
                                    "x": "126.951459",
                                    "y": "37.544559"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 82,
                        "sectionTime": 1
                    }
                ]
            },
            {
                "pathType": 3,
                "info": {
                    "trafficDistance": 9995.0,
                    "totalWalk": 702,
                    "totalTime": 37,
                    "payment": 1550,
                    "busTransitCount": 1,
                    "subwayTransitCount": 1,
                    "mapObj": "873:1:54:60@6:2:631:626",
                    "firstStartStation": "지하철2호선강남역",
                    "lastEndStation": "공덕",
                    "totalStationCount": 11,
                    "busStationCount": 6,
                    "subwayStationCount": 5,
                    "totalDistance": 10697.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 16
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 349,
                        "sectionTime": 5
                    },
                    {
                        "trafficType": 2,
                        "distance": 4995,
                        "sectionTime": 17,
                        "stationCount": 6,
                        "lane": [
                            {
                                "busNo": "144",
                                "type": 11,
                                "busID": 873,
                                "busLocalBlID": "100100023",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            },
                            {
                                "busNo": "402",
                                "type": 11,
                                "busID": 1050,
                                "busLocalBlID": "100100063",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            },
                            {
                                "busNo": "420",
                                "type": 11,
                                "busID": 1054,
                                "busLocalBlID": "100100068",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            }
                        ],
                        "intervalTime": 8,
                        "startName": "지하철2호선강남역",
                        "startX": 127.026268,
                        "startY": 37.500903,
                        "endName": "서울중부기술교육원.블루스퀘어",
                        "endX": 127.003595,
                        "endY": 37.541613,
                        "startID": 106041,
                        "startStationCityCode": 1000,
                        "startStationProviderCode": 4,
                        "startLocalStationID": "121000012",
                        "startArsID": "22012",
                        "endID": 105268,
                        "endStationCityCode": 1000,
                        "endStationProviderCode": 4,
                        "endLocalStationID": "102000066",
                        "endArsID": "03160",
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 106041,
                                    "stationName": "지하철2호선강남역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000012",
                                    "arsID": "22012",
                                    "x": "127.026268",
                                    "y": "37.500903",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 1,
                                    "stationID": 105923,
                                    "stationName": "논현역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000014",
                                    "arsID": "22014",
                                    "x": "127.023653",
                                    "y": "37.506342",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 2,
                                    "stationID": 105884,
                                    "stationName": "신사역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000016",
                                    "arsID": "22016",
                                    "x": "127.020593",
                                    "y": "37.512867",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 3,
                                    "stationID": 206223,
                                    "stationName": "한남대교전망카페",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "122000408",
                                    "arsID": "23531",
                                    "x": "127.015838",
                                    "y": "37.524415",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 4,
                                    "stationID": 105378,
                                    "stationName": "한남오거리",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000072",
                                    "arsID": "03166",
                                    "x": "127.008281",
                                    "y": "37.532957",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 5,
                                    "stationID": 105318,
                                    "stationName": "순천향대학병원",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000068",
                                    "arsID": "03162",
                                    "x": "127.005746",
                                    "y": "37.536405",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 6,
                                    "stationID": 105268,
                                    "stationName": "서울중부기술교육원.블루스퀘어",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000066",
                                    "arsID": "03160",
                                    "x": "127.003595",
                                    "y": "37.541613",
                                    "isNonStop": "N"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 254,
                        "sectionTime": 4
                    },
                    {
                        "trafficType": 1,
                        "distance": 5000,
                        "sectionTime": 10,
                        "stationCount": 5,
                        "lane": [
                            {
                                "name": "수도권 6호선",
                                "subwayCode": 6,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 8,
                        "startName": "한강진",
                        "startX": 127.001797,
                        "startY": 37.539822,
                        "endName": "공덕",
                        "endX": 126.951968,
                        "endY": 37.543509,
                        "way": "공덕",
                        "wayCode": 1,
                        "door": "null",
                        "startID": 631,
                        "endID": 626,
                        "startExitNo": "2",
                        "startExitX": 127.00203394837686,
                        "startExitY": 37.540706014622664,
                        "endExitNo": "1",
                        "endExitX": 126.95049820339278,
                        "endExitY": 37.54396675439449,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 631,
                                    "stationName": "한강진",
                                    "x": "127.001802",
                                    "y": "37.539829"
                                },
                                {
                                    "index": 1,
                                    "stationID": 630,
                                    "stationName": "이태원",
                                    "x": "126.99459",
                                    "y": "37.534542"
                                },
                                {
                                    "index": 2,
                                    "stationID": 629,
                                    "stationName": "녹사평(용산구청)",
                                    "x": "126.986895",
                                    "y": "37.534586"
                                },
                                {
                                    "index": 3,
                                    "stationID": 628,
                                    "stationName": "삼각지",
                                    "x": "126.974019",
                                    "y": "37.535592"
                                },
                                {
                                    "index": 4,
                                    "stationID": 627,
                                    "stationName": "효창공원앞",
                                    "x": "126.961437",
                                    "y": "37.539274"
                                },
                                {
                                    "index": 5,
                                    "stationID": 626,
                                    "stationName": "공덕",
                                    "x": "126.951969",
                                    "y": "37.543515"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 99,
                        "sectionTime": 1
                    }
                ]
            },
            {
                "pathType": 1,
                "info": {
                    "trafficDistance": 24500.0,
                    "totalWalk": 85,
                    "totalTime": 47,
                    "payment": 1650,
                    "busTransitCount": 0,
                    "subwayTransitCount": 2,
                    "mapObj": "2:2:222:236@5:2:523:529",
                    "firstStartStation": "강남",
                    "lastEndStation": "공덕",
                    "totalStationCount": 20,
                    "busStationCount": 0,
                    "subwayStationCount": 20,
                    "totalDistance": 24585.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 10
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 3,
                        "sectionTime": 1
                    },
                    {
                        "trafficType": 1,
                        "distance": 17900,
                        "sectionTime": 30,
                        "stationCount": 14,
                        "lane": [
                            {
                                "name": "수도권 2호선",
                                "subwayCode": 2,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "강남",
                        "startX": 127.027618,
                        "startY": 37.497949,
                        "endName": "영등포구청",
                        "endX": 126.896559,
                        "endY": 37.525462,
                        "way": "영등포구청",
                        "wayCode": 2,
                        "door": "7-4",
                        "startID": 222,
                        "endID": 236,
                        "startExitNo": "8",
                        "startExitX": 127.02718636224867,
                        "startExitY": 37.497534149126984,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 222,
                                    "stationName": "강남",
                                    "x": "127.027619",
                                    "y": "37.497952"
                                },
                                {
                                    "index": 1,
                                    "stationID": 223,
                                    "stationName": "교대",
                                    "x": "127.014395",
                                    "y": "37.493902"
                                },
                                {
                                    "index": 2,
                                    "stationID": 224,
                                    "stationName": "서초",
                                    "x": "127.007702",
                                    "y": "37.491852"
                                },
                                {
                                    "index": 3,
                                    "stationID": 225,
                                    "stationName": "방배",
                                    "x": "126.997667",
                                    "y": "37.481496"
                                },
                                {
                                    "index": 4,
                                    "stationID": 226,
                                    "stationName": "사당",
                                    "x": "126.981363",
                                    "y": "37.476575"
                                },
                                {
                                    "index": 5,
                                    "stationID": 227,
                                    "stationName": "낙성대",
                                    "x": "126.963428",
                                    "y": "37.477119"
                                },
                                {
                                    "index": 6,
                                    "stationID": 228,
                                    "stationName": "서울대입구",
                                    "x": "126.952729",
                                    "y": "37.481207"
                                },
                                {
                                    "index": 7,
                                    "stationID": 229,
                                    "stationName": "봉천",
                                    "x": "126.941586",
                                    "y": "37.482477"
                                },
                                {
                                    "index": 8,
                                    "stationID": 230,
                                    "stationName": "신림",
                                    "x": "126.929699",
                                    "y": "37.484231"
                                },
                                {
                                    "index": 9,
                                    "stationID": 231,
                                    "stationName": "신대방",
                                    "x": "126.913346",
                                    "y": "37.487563"
                                },
                                {
                                    "index": 10,
                                    "stationID": 232,
                                    "stationName": "구로디지털단지",
                                    "x": "126.901594",
                                    "y": "37.485215"
                                },
                                {
                                    "index": 11,
                                    "stationID": 233,
                                    "stationName": "대림",
                                    "x": "126.89489",
                                    "y": "37.493393"
                                },
                                {
                                    "index": 12,
                                    "stationID": 234,
                                    "stationName": "신도림",
                                    "x": "126.891114",
                                    "y": "37.508656"
                                },
                                {
                                    "index": 13,
                                    "stationID": 235,
                                    "stationName": "문래",
                                    "x": "126.894803",
                                    "y": "37.518007"
                                },
                                {
                                    "index": 14,
                                    "stationID": 236,
                                    "stationName": "영등포구청",
                                    "x": "126.896564",
                                    "y": "37.525469"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 6600,
                        "sectionTime": 15,
                        "stationCount": 6,
                        "lane": [
                            {
                                "name": "수도권 5호선",
                                "subwayCode": 5,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "영등포구청",
                        "startX": 126.895332,
                        "startY": 37.524216,
                        "endName": "공덕",
                        "endX": 126.951455,
                        "endY": 37.544559,
                        "way": "공덕",
                        "wayCode": 2,
                        "door": "null",
                        "startID": 523,
                        "endID": 529,
                        "endExitNo": "1",
                        "endExitX": 126.95049820339278,
                        "endExitY": 37.54396675439449,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 523,
                                    "stationName": "영등포구청",
                                    "x": "126.895342",
                                    "y": "37.524218"
                                },
                                {
                                    "index": 1,
                                    "stationID": 524,
                                    "stationName": "영등포시장",
                                    "x": "126.905056",
                                    "y": "37.522735"
                                },
                                {
                                    "index": 2,
                                    "stationID": 525,
                                    "stationName": "신길",
                                    "x": "126.915225",
                                    "y": "37.517566"
                                },
                                {
                                    "index": 3,
                                    "stationID": 526,
                                    "stationName": "여의도",
                                    "x": "126.924079",
                                    "y": "37.521625"
                                },
                                {
                                    "index": 4,
                                    "stationID": 527,
                                    "stationName": "여의나루",
                                    "x": "126.93301",
                                    "y": "37.527131"
                                },
                                {
                                    "index": 5,
                                    "stationID": 528,
                                    "stationName": "마포",
                                    "x": "126.945799",
                                    "y": "37.539488"
                                },
                                {
                                    "index": 6,
                                    "stationID": 529,
                                    "stationName": "공덕",
                                    "x": "126.951459",
                                    "y": "37.544559"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 82,
                        "sectionTime": 1
                    }
                ]
            },
            {
                "pathType": 3,
                "info": {
                    "trafficDistance": 10691.0,
                    "totalWalk": 700,
                    "totalTime": 39,
                    "payment": 1650,
                    "busTransitCount": 1,
                    "subwayTransitCount": 1,
                    "mapObj": "1050:1:35:42@6:2:631:626",
                    "firstStartStation": "신분당선강남역",
                    "lastEndStation": "공덕",
                    "totalStationCount": 12,
                    "busStationCount": 7,
                    "subwayStationCount": 5,
                    "totalDistance": 11391.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 17
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 347,
                        "sectionTime": 5
                    },
                    {
                        "trafficType": 2,
                        "distance": 5691,
                        "sectionTime": 19,
                        "stationCount": 7,
                        "lane": [
                            {
                                "busNo": "402",
                                "type": 11,
                                "busID": 1050,
                                "busLocalBlID": "100100063",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            },
                            {
                                "busNo": "420",
                                "type": 11,
                                "busID": 1054,
                                "busLocalBlID": "100100068",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            }
                        ],
                        "intervalTime": 9,
                        "startName": "신분당선강남역",
                        "startX": 127.02907,
                        "startY": 37.495042,
                        "endName": "서울중부기술교육원.블루스퀘어",
                        "endX": 127.003595,
                        "endY": 37.541613,
                        "startID": 106188,
                        "startStationCityCode": 1000,
                        "startStationProviderCode": 4,
                        "startLocalStationID": "121000010",
                        "startArsID": "22010",
                        "endID": 105268,
                        "endStationCityCode": 1000,
                        "endStationProviderCode": 4,
                        "endLocalStationID": "102000066",
                        "endArsID": "03160",
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 106188,
                                    "stationName": "신분당선강남역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000010",
                                    "arsID": "22010",
                                    "x": "127.02907",
                                    "y": "37.495042",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 1,
                                    "stationID": 106041,
                                    "stationName": "지하철2호선강남역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000012",
                                    "arsID": "22012",
                                    "x": "127.026268",
                                    "y": "37.500903",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 2,
                                    "stationID": 105923,
                                    "stationName": "논현역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000014",
                                    "arsID": "22014",
                                    "x": "127.023653",
                                    "y": "37.506342",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 3,
                                    "stationID": 105884,
                                    "stationName": "신사역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000016",
                                    "arsID": "22016",
                                    "x": "127.020593",
                                    "y": "37.512867",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 4,
                                    "stationID": 206223,
                                    "stationName": "한남대교전망카페",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "122000408",
                                    "arsID": "23531",
                                    "x": "127.015838",
                                    "y": "37.524415",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 5,
                                    "stationID": 105378,
                                    "stationName": "한남오거리",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000072",
                                    "arsID": "03166",
                                    "x": "127.008281",
                                    "y": "37.532957",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 6,
                                    "stationID": 105318,
                                    "stationName": "순천향대학병원",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000068",
                                    "arsID": "03162",
                                    "x": "127.005746",
                                    "y": "37.536405",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 7,
                                    "stationID": 105268,
                                    "stationName": "서울중부기술교육원.블루스퀘어",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000066",
                                    "arsID": "03160",
                                    "x": "127.003595",
                                    "y": "37.541613",
                                    "isNonStop": "N"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 254,
                        "sectionTime": 4
                    },
                    {
                        "trafficType": 1,
                        "distance": 5000,
                        "sectionTime": 10,
                        "stationCount": 5,
                        "lane": [
                            {
                                "name": "수도권 6호선",
                                "subwayCode": 6,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 8,
                        "startName": "한강진",
                        "startX": 127.001797,
                        "startY": 37.539822,
                        "endName": "공덕",
                        "endX": 126.951968,
                        "endY": 37.543509,
                        "way": "공덕",
                        "wayCode": 1,
                        "door": "null",
                        "startID": 631,
                        "endID": 626,
                        "startExitNo": "2",
                        "startExitX": 127.00203394837686,
                        "startExitY": 37.540706014622664,
                        "endExitNo": "1",
                        "endExitX": 126.95049820339278,
                        "endExitY": 37.54396675439449,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 631,
                                    "stationName": "한강진",
                                    "x": "127.001802",
                                    "y": "37.539829"
                                },
                                {
                                    "index": 1,
                                    "stationID": 630,
                                    "stationName": "이태원",
                                    "x": "126.99459",
                                    "y": "37.534542"
                                },
                                {
                                    "index": 2,
                                    "stationID": 629,
                                    "stationName": "녹사평(용산구청)",
                                    "x": "126.986895",
                                    "y": "37.534586"
                                },
                                {
                                    "index": 3,
                                    "stationID": 628,
                                    "stationName": "삼각지",
                                    "x": "126.974019",
                                    "y": "37.535592"
                                },
                                {
                                    "index": 4,
                                    "stationID": 627,
                                    "stationName": "효창공원앞",
                                    "x": "126.961437",
                                    "y": "37.539274"
                                },
                                {
                                    "index": 5,
                                    "stationID": 626,
                                    "stationName": "공덕",
                                    "x": "126.951969",
                                    "y": "37.543515"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 99,
                        "sectionTime": 1
                    }
                ]
            },
            {
                "pathType": 3,
                "info": {
                    "trafficDistance": 12738.0,
                    "totalWalk": 610,
                    "totalTime": 42,
                    "payment": 1650,
                    "busTransitCount": 1,
                    "subwayTransitCount": 2,
                    "mapObj": "1440:1:21:29@4:2:431:428@6:2:628:626",
                    "firstStartStation": "강남역12번출구",
                    "lastEndStation": "공덕",
                    "totalStationCount": 13,
                    "busStationCount": 8,
                    "subwayStationCount": 5,
                    "totalDistance": 13348.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 19
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 191,
                        "sectionTime": 3
                    },
                    {
                        "trafficType": 2,
                        "distance": 5938,
                        "sectionTime": 20,
                        "stationCount": 8,
                        "lane": [
                            {
                                "busNo": "360",
                                "type": 11,
                                "busID": 1440,
                                "busLocalBlID": "100100057",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            }
                        ],
                        "intervalTime": 6,
                        "startName": "강남역12번출구",
                        "startX": 127.029553,
                        "startY": 37.498776,
                        "endName": "동작역.국립현충원",
                        "endX": 126.976724,
                        "endY": 37.503152,
                        "startID": 106323,
                        "startStationCityCode": 1000,
                        "startStationProviderCode": 4,
                        "startLocalStationID": "122000181",
                        "startArsID": "23284",
                        "endID": 104777,
                        "endStationCityCode": 1000,
                        "endStationProviderCode": 4,
                        "endLocalStationID": "119000041",
                        "endArsID": "20134",
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 106323,
                                    "stationName": "강남역12번출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "122000181",
                                    "arsID": "23284",
                                    "x": "127.029553",
                                    "y": "37.498776",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 1,
                                    "stationID": 106041,
                                    "stationName": "지하철2호선강남역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000012",
                                    "arsID": "22012",
                                    "x": "127.026268",
                                    "y": "37.500903",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 2,
                                    "stationID": 105923,
                                    "stationName": "논현역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000014",
                                    "arsID": "22014",
                                    "x": "127.023653",
                                    "y": "37.506342",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 3,
                                    "stationID": 105845,
                                    "stationName": "논현역7번출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000107",
                                    "arsID": "22183",
                                    "x": "127.019344",
                                    "y": "37.510649",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 4,
                                    "stationID": 105503,
                                    "stationName": "반포역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000017",
                                    "arsID": "22017",
                                    "x": "127.012033",
                                    "y": "37.508354",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 5,
                                    "stationID": 105257,
                                    "stationName": "고속터미널",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000019",
                                    "arsID": "22019",
                                    "x": "127.005217",
                                    "y": "37.506305",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 6,
                                    "stationID": 105156,
                                    "stationName": "신반포역.세화여중고",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000021",
                                    "arsID": "22021",
                                    "x": "126.995789",
                                    "y": "37.503387",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 7,
                                    "stationID": 105032,
                                    "stationName": "구반포역.세화고등학교",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000023",
                                    "arsID": "22023",
                                    "x": "126.989837",
                                    "y": "37.50194",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 8,
                                    "stationID": 104777,
                                    "stationName": "동작역.국립현충원",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "119000041",
                                    "arsID": "20134",
                                    "x": "126.976724",
                                    "y": "37.503152",
                                    "isNonStop": "N"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 320,
                        "sectionTime": 5
                    },
                    {
                        "trafficType": 1,
                        "distance": 4700,
                        "sectionTime": 7,
                        "stationCount": 3,
                        "lane": [
                            {
                                "name": "수도권 4호선",
                                "subwayCode": 4,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "동작",
                        "startX": 126.980335,
                        "startY": 37.502913,
                        "endName": "삼각지",
                        "endX": 126.97298,
                        "endY": 37.534539,
                        "way": "삼각지",
                        "wayCode": 1,
                        "door": "1-1",
                        "startID": 431,
                        "endID": 428,
                        "startExitX": 126.97664244926413,
                        "startExitY": 37.50327144279671,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 431,
                                    "stationName": "동작",
                                    "x": "126.980341",
                                    "y": "37.502915"
                                },
                                {
                                    "index": 1,
                                    "stationID": 430,
                                    "stationName": "이촌",
                                    "x": "126.974396",
                                    "y": "37.522427"
                                },
                                {
                                    "index": 2,
                                    "stationID": 429,
                                    "stationName": "신용산",
                                    "x": "126.967948",
                                    "y": "37.529241"
                                },
                                {
                                    "index": 3,
                                    "stationID": 428,
                                    "stationName": "삼각지",
                                    "x": "126.972987",
                                    "y": "37.534547"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 2100,
                        "sectionTime": 6,
                        "stationCount": 2,
                        "lane": [
                            {
                                "name": "수도권 6호선",
                                "subwayCode": 6,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 8,
                        "startName": "삼각지",
                        "startX": 126.974018,
                        "startY": 37.535584,
                        "endName": "공덕",
                        "endX": 126.951968,
                        "endY": 37.543509,
                        "way": "공덕",
                        "wayCode": 1,
                        "door": "null",
                        "startID": 628,
                        "endID": 626,
                        "endExitNo": "1",
                        "endExitX": 126.95049820339278,
                        "endExitY": 37.54396675439449,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 628,
                                    "stationName": "삼각지",
                                    "x": "126.974019",
                                    "y": "37.535592"
                                },
                                {
                                    "index": 1,
                                    "stationID": 627,
                                    "stationName": "효창공원앞",
                                    "x": "126.961437",
                                    "y": "37.539274"
                                },
                                {
                                    "index": 2,
                                    "stationID": 626,
                                    "stationName": "공덕",
                                    "x": "126.951969",
                                    "y": "37.543515"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 99,
                        "sectionTime": 1
                    }
                ]
            },
            {
                "pathType": 3,
                "info": {
                    "trafficDistance": 16718.0,
                    "totalWalk": 355,
                    "totalTime": 46,
                    "payment": 1650,
                    "busTransitCount": 1,
                    "subwayTransitCount": 2,
                    "mapObj": "2:2:222:226@4:2:433:427@908:1:21:31",
                    "firstStartStation": "강남",
                    "lastEndStation": "공덕역8번출구",
                    "totalStationCount": 20,
                    "busStationCount": 10,
                    "subwayStationCount": 10,
                    "totalDistance": 17073.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 16
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 3,
                        "sectionTime": 1
                    },
                    {
                        "trafficType": 1,
                        "distance": 5200,
                        "sectionTime": 9,
                        "stationCount": 4,
                        "lane": [
                            {
                                "name": "수도권 2호선",
                                "subwayCode": 2,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "강남",
                        "startX": 127.027618,
                        "startY": 37.497949,
                        "endName": "사당",
                        "endX": 126.981359,
                        "endY": 37.476575,
                        "way": "사당",
                        "wayCode": 2,
                        "door": "6-1",
                        "startID": 222,
                        "endID": 226,
                        "startExitNo": "8",
                        "startExitX": 127.02718636224867,
                        "startExitY": 37.497534149126984,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 222,
                                    "stationName": "강남",
                                    "x": "127.027619",
                                    "y": "37.497952"
                                },
                                {
                                    "index": 1,
                                    "stationID": 223,
                                    "stationName": "교대",
                                    "x": "127.014395",
                                    "y": "37.493902"
                                },
                                {
                                    "index": 2,
                                    "stationID": 224,
                                    "stationName": "서초",
                                    "x": "127.007702",
                                    "y": "37.491852"
                                },
                                {
                                    "index": 3,
                                    "stationID": 225,
                                    "stationName": "방배",
                                    "x": "126.997667",
                                    "y": "37.481496"
                                },
                                {
                                    "index": 4,
                                    "stationID": 226,
                                    "stationName": "사당",
                                    "x": "126.981363",
                                    "y": "37.476575"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 8800,
                        "sectionTime": 16,
                        "stationCount": 6,
                        "lane": [
                            {
                                "name": "수도권 4호선",
                                "subwayCode": 4,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "사당",
                        "startX": 126.981662,
                        "startY": 37.476793,
                        "endName": "숙대입구",
                        "endX": 126.972107,
                        "endY": 37.544587,
                        "way": "숙대입구",
                        "wayCode": 1,
                        "door": "null",
                        "startID": 433,
                        "endID": 427,
                        "endExitNo": "7",
                        "endExitX": 126.97217618338237,
                        "endExitY": 37.54374725560604,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 433,
                                    "stationName": "사당",
                                    "x": "126.981668",
                                    "y": "37.476798"
                                },
                                {
                                    "index": 1,
                                    "stationID": 432,
                                    "stationName": "총신대입구(이수)",
                                    "x": "126.982193",
                                    "y": "37.486803"
                                },
                                {
                                    "index": 2,
                                    "stationID": 431,
                                    "stationName": "동작",
                                    "x": "126.980341",
                                    "y": "37.502915"
                                },
                                {
                                    "index": 3,
                                    "stationID": 430,
                                    "stationName": "이촌",
                                    "x": "126.974396",
                                    "y": "37.522427"
                                },
                                {
                                    "index": 4,
                                    "stationID": 429,
                                    "stationName": "신용산",
                                    "x": "126.967948",
                                    "y": "37.529241"
                                },
                                {
                                    "index": 5,
                                    "stationID": 428,
                                    "stationName": "삼각지",
                                    "x": "126.972987",
                                    "y": "37.534547"
                                },
                                {
                                    "index": 6,
                                    "stationID": 427,
                                    "stationName": "숙대입구",
                                    "x": "126.972114",
                                    "y": "37.544592"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 281,
                        "sectionTime": 4
                    },
                    {
                        "trafficType": 2,
                        "distance": 2718,
                        "sectionTime": 15,
                        "stationCount": 10,
                        "lane": [
                            {
                                "busNo": "1711",
                                "type": 12,
                                "busID": 908,
                                "busLocalBlID": "100100185",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            }
                        ],
                        "intervalTime": 6,
                        "startName": "남영역",
                        "startX": 126.971961,
                        "startY": 37.542054,
                        "endName": "공덕역8번출구",
                        "endX": 126.951561,
                        "endY": 37.543487,
                        "startID": 104649,
                        "startStationCityCode": 1000,
                        "startStationProviderCode": 4,
                        "startLocalStationID": "102000018",
                        "startArsID": "03110",
                        "endID": 104091,
                        "endStationCityCode": 1000,
                        "endStationProviderCode": 4,
                        "endLocalStationID": "113000062",
                        "endArsID": "14153",
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 104649,
                                    "stationName": "남영역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000018",
                                    "arsID": "03110",
                                    "x": "126.971961",
                                    "y": "37.542054",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 1,
                                    "stationID": 104577,
                                    "stationName": "용산경찰서",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000045",
                                    "arsID": "03139",
                                    "x": "126.969198",
                                    "y": "37.540552",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 2,
                                    "stationID": 104526,
                                    "stationName": "용산꿈나무종합타운.원효로우체국",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000047",
                                    "arsID": "03141",
                                    "x": "126.966938",
                                    "y": "37.538658",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 3,
                                    "stationID": 104421,
                                    "stationName": "원효로2가",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000050",
                                    "arsID": "03144",
                                    "x": "126.962977",
                                    "y": "37.536263",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 4,
                                    "stationID": 104351,
                                    "stationName": "용문시장",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000154",
                                    "arsID": "03248",
                                    "x": "126.961374",
                                    "y": "37.535996",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 5,
                                    "stationID": 111945,
                                    "stationName": "중앙하이츠빌라앞",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000151",
                                    "arsID": "03245",
                                    "x": "126.960089",
                                    "y": "37.538111",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 6,
                                    "stationID": 104266,
                                    "stationName": "도원삼성래미안아파트",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "102000149",
                                    "arsID": "03243",
                                    "x": "126.957451",
                                    "y": "37.5398",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 7,
                                    "stationID": 104209,
                                    "stationName": "도화동현대아파트",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "113000064",
                                    "arsID": "14155",
                                    "x": "126.955801",
                                    "y": "37.540497",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 8,
                                    "stationID": 86105,
                                    "stationName": "공덕역10번출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "113000471",
                                    "arsID": "14134",
                                    "x": "126.952952",
                                    "y": "37.541923",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 9,
                                    "stationID": 104073,
                                    "stationName": "서울대동창회관",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "113000061",
                                    "arsID": "14152",
                                    "x": "126.950796",
                                    "y": "37.542354",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 10,
                                    "stationID": 104091,
                                    "stationName": "공덕역8번출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "113000062",
                                    "arsID": "14153",
                                    "x": "126.951561",
                                    "y": "37.543487",
                                    "isNonStop": "N"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 71,
                        "sectionTime": 1
                    }
                ]
            },
            {
                "pathType": 3,
                "info": {
                    "trafficDistance": 12530.0,
                    "totalWalk": 441,
                    "totalTime": 38,
                    "payment": 1650,
                    "busTransitCount": 1,
                    "subwayTransitCount": 2,
                    "mapObj": "2826975:1:55:63@4:2:432:428@6:2:628:626",
                    "firstStartStation": "강남역9번출구",
                    "lastEndStation": "공덕",
                    "totalStationCount": 14,
                    "busStationCount": 8,
                    "subwayStationCount": 6,
                    "totalDistance": 12971.0,
                    "totalWalkTime": -1,
                    "checkIntervalTime": 100,
                    "checkIntervalTimeOverYn": "N",
                    "totalIntervalTime": 28
                },
                "subPath": [
                    {
                        "trafficType": 3,
                        "distance": 98,
                        "sectionTime": 1
                    },
                    {
                        "trafficType": 2,
                        "distance": 3930,
                        "sectionTime": 16,
                        "stationCount": 8,
                        "lane": [
                            {
                                "busNo": "040",
                                "type": 11,
                                "busID": 2826975,
                                "busLocalBlID": "104000014",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            },
                            {
                                "busNo": "N64",
                                "type": 11,
                                "busID": 2811225,
                                "busLocalBlID": "115000010",
                                "busCityCode": 1000,
                                "busProviderCode": 4
                            }
                        ],
                        "intervalTime": 15,
                        "startName": "강남역9번출구",
                        "startX": 127.026557,
                        "startY": 37.497824,
                        "endName": "이수역",
                        "endX": 126.984682,
                        "endY": 37.485875,
                        "startID": 157359,
                        "startStationCityCode": 1000,
                        "startStationProviderCode": 4,
                        "startLocalStationID": "121000091",
                        "startArsID": "22167",
                        "endID": 167076,
                        "endStationCityCode": 1000,
                        "endStationProviderCode": 4,
                        "endLocalStationID": "121000311",
                        "endArsID": "22393",
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 157359,
                                    "stationName": "강남역9번출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000091",
                                    "arsID": "22167",
                                    "x": "127.026557",
                                    "y": "37.497824",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 1,
                                    "stationID": 106001,
                                    "stationName": "서초동진흥아파트",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000092",
                                    "arsID": "22168",
                                    "x": "127.02275",
                                    "y": "37.49663",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 2,
                                    "stationID": 105832,
                                    "stationName": "서초동유원아파트",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000093",
                                    "arsID": "22169",
                                    "x": "127.019596",
                                    "y": "37.495676",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 3,
                                    "stationID": 105710,
                                    "stationName": "지하철2호선교대역4출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000094",
                                    "arsID": "22170",
                                    "x": "127.015811",
                                    "y": "37.494518",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 4,
                                    "stationID": 105373,
                                    "stationName": "교대역10번출구",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000058",
                                    "arsID": "22134",
                                    "x": "127.012883",
                                    "y": "37.493619",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 5,
                                    "stationID": 5008662,
                                    "stationName": "대법원앞",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121001328",
                                    "arsID": "22426",
                                    "x": "127.00626",
                                    "y": "37.4916",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 6,
                                    "stationID": 167074,
                                    "stationName": "내방역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000309",
                                    "arsID": "22391",
                                    "x": "126.992552",
                                    "y": "37.487546",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 7,
                                    "stationID": 167075,
                                    "stationName": "방배고개",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000310",
                                    "arsID": "22392",
                                    "x": "126.988813",
                                    "y": "37.486424",
                                    "isNonStop": "N"
                                },
                                {
                                    "index": 8,
                                    "stationID": 167076,
                                    "stationName": "이수역",
                                    "stationCityCode": 1000,
                                    "stationProviderCode": 4,
                                    "localStationID": "121000311",
                                    "arsID": "22393",
                                    "x": "126.984682",
                                    "y": "37.485875",
                                    "isNonStop": "N"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 244,
                        "sectionTime": 4
                    },
                    {
                        "trafficType": 1,
                        "distance": 6500,
                        "sectionTime": 10,
                        "stationCount": 4,
                        "lane": [
                            {
                                "name": "수도권 4호선",
                                "subwayCode": 4,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 5,
                        "startName": "총신대입구(이수)",
                        "startX": 126.982182,
                        "startY": 37.4868,
                        "endName": "삼각지",
                        "endX": 126.97298,
                        "endY": 37.534539,
                        "way": "삼각지",
                        "wayCode": 1,
                        "door": "1-1",
                        "startID": 432,
                        "endID": 428,
                        "startExitNo": "5",
                        "startExitX": 126.9826499822193,
                        "startExitY": 37.48527903669019,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 432,
                                    "stationName": "총신대입구(이수)",
                                    "x": "126.982193",
                                    "y": "37.486803"
                                },
                                {
                                    "index": 1,
                                    "stationID": 431,
                                    "stationName": "동작",
                                    "x": "126.980341",
                                    "y": "37.502915"
                                },
                                {
                                    "index": 2,
                                    "stationID": 430,
                                    "stationName": "이촌",
                                    "x": "126.974396",
                                    "y": "37.522427"
                                },
                                {
                                    "index": 3,
                                    "stationID": 429,
                                    "stationName": "신용산",
                                    "x": "126.967948",
                                    "y": "37.529241"
                                },
                                {
                                    "index": 4,
                                    "stationID": 428,
                                    "stationName": "삼각지",
                                    "x": "126.972987",
                                    "y": "37.534547"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 0,
                        "sectionTime": 0
                    },
                    {
                        "trafficType": 1,
                        "distance": 2100,
                        "sectionTime": 6,
                        "stationCount": 2,
                        "lane": [
                            {
                                "name": "수도권 6호선",
                                "subwayCode": 6,
                                "subwayCityCode": 1000
                            }
                        ],
                        "intervalTime": 8,
                        "startName": "삼각지",
                        "startX": 126.974018,
                        "startY": 37.535584,
                        "endName": "공덕",
                        "endX": 126.951968,
                        "endY": 37.543509,
                        "way": "공덕",
                        "wayCode": 1,
                        "door": "null",
                        "startID": 628,
                        "endID": 626,
                        "endExitNo": "1",
                        "endExitX": 126.95049820339278,
                        "endExitY": 37.54396675439449,
                        "passStopList": {
                            "stations": [
                                {
                                    "index": 0,
                                    "stationID": 628,
                                    "stationName": "삼각지",
                                    "x": "126.974019",
                                    "y": "37.535592"
                                },
                                {
                                    "index": 1,
                                    "stationID": 627,
                                    "stationName": "효창공원앞",
                                    "x": "126.961437",
                                    "y": "37.539274"
                                },
                                {
                                    "index": 2,
                                    "stationID": 626,
                                    "stationName": "공덕",
                                    "x": "126.951969",
                                    "y": "37.543515"
                                }
                            ]
                        }
                    },
                    {
                        "trafficType": 3,
                        "distance": 99,
                        "sectionTime": 1
                    }
                ]
            }
        ]
    }
};
*/

// 더미 데이터 비활성화
export default null;