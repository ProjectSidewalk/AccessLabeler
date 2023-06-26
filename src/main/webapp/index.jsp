<!DOCTYPE html>
<html>
<head>


    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter">

    <link rel="stylesheet" href="css/index.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">

    <!-- Using jsDelivr -->
<%--    <script src="https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js"></script>--%>

    <script src="https://code.jquery.com/jquery-3.6.3.min.js" integrity="sha256-pvPw+upLPUjgMXY0G+8O0xUf+/Im1MZjXxxgOcBQBXU=" crossorigin="anonymous"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"></script>
    <script src="https://docs.opencv.org/4.7.0/opencv.js"></script>

<%--    <script src="js/data-selected.js"></script>--%>
    <script src="js/data-KCGIS-100-random.js"></script>

    <script src="js/labelsDescriptor.js"></script>
    <script src="js/utils.js"></script>
    <script src="js/index.js"></script>
</head>
<body style="margin: 0;">


<svg fill="none" xmlns="http://www.w3.org/2000/svg" style="display: none;">

    <%-- viewBox="0 0 24 24" --%>
    <symbol id="tick-icon">
        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#292D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke="#292D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </symbol>

    <symbol id="close-icon">
        <path id="Vector" d="M9 9L11.9999 11.9999M11.9999 11.9999L14.9999 14.9999M11.9999 11.9999L9 14.9999M11.9999 11.9999L14.9999 9M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </symbol>



    <%-- viewBox="0 0 31 31" --%>
    <symbol id="shelter-icon">
        <path d="M25.8333 3.87504H9.04159V2.58337H7.74992C7.36161 2.62621 6.99063 2.76729 6.67197 2.99328C6.35332 3.21928 6.0975 3.52275 5.92867 3.87504H2.58325V6.45837H4.81784C2.58325 13.6659 2.58325 28.4167 2.58325 28.4167H9.04159V6.45837H25.8333M28.4166 10.9792C28.4043 10.3711 28.2205 9.7789 27.8864 9.27069C27.5523 8.76248 27.0814 8.35895 26.5281 8.10657C25.9747 7.85419 25.3613 7.76321 24.7585 7.84412C24.1557 7.92502 23.5881 8.17451 23.1208 8.56387C22.6536 8.95323 22.3058 9.46662 22.1175 10.0449C21.9293 10.6233 21.9081 11.243 22.0566 11.8328C22.2051 12.4226 22.5171 12.9585 22.9567 13.3788C23.3963 13.799 23.9457 14.0866 24.5416 14.2084V28.4167H25.8333V14.2084C26.5736 14.0574 27.2376 13.6516 27.7096 13.0616C28.1817 12.4715 28.4318 11.7347 28.4166 10.9792ZM19.3749 14.8542V20.6667H18.0833V28.4167H16.1458V21.9584H14.8541V28.4167H12.9166V20.6667H11.6249V14.8542C11.6249 14.3404 11.829 13.8475 12.1924 13.4842C12.5558 13.1208 13.0486 12.9167 13.5624 12.9167H17.4374C17.9513 12.9167 18.4441 13.1208 18.8074 13.4842C19.1708 13.8475 19.3749 14.3404 19.3749 14.8542ZM15.4999 8.39587C15.1167 8.39587 14.7421 8.50951 14.4235 8.7224C14.1049 8.9353 13.8565 9.23789 13.7099 9.59193C13.5633 9.94596 13.5249 10.3355 13.5996 10.7114C13.6744 11.0872 13.8589 11.4324 14.1299 11.7034C14.4009 11.9744 14.7461 12.1589 15.1219 12.2336C15.4978 12.3084 15.8873 12.27 16.2414 12.1234C16.5954 11.9767 16.898 11.7284 17.1109 11.4098C17.3238 11.0912 17.4374 10.7166 17.4374 10.3334C17.4374 9.81952 17.2333 9.32671 16.8699 8.96335C16.5066 8.6 16.0138 8.39587 15.4999 8.39587Z" fill="black"></path>
    </symbol>


    <%-- viewBox="0 0 39 39" --%>
    <symbol id="signage-icon">
        <path d="M35.7501 11.375V26C35.7501 27.1537 35.1326 28.21 34.1251 28.795V31.2812C34.1251 31.9475 33.5726 32.5 32.9063 32.5H32.0938C31.4276 32.5 30.8751 31.9475 30.8751 31.2812V29.25H19.5001V31.2812C19.5001 31.9475 18.9476 32.5 18.2813 32.5H17.4688C16.8026 32.5 16.2501 31.9475 16.2501 31.2812V28.795C15.2588 28.21 14.6251 27.1537 14.6251 26V11.375C14.6251 6.5 19.5001 6.5 25.1876 6.5C30.8751 6.5 35.7501 6.5 35.7501 11.375ZM21.1251 24.375C21.1251 23.4813 20.3938 22.75 19.5001 22.75C18.6063 22.75 17.8751 23.4813 17.8751 24.375C17.8751 25.2687 18.6063 26 19.5001 26C20.3938 26 21.1251 25.2687 21.1251 24.375ZM32.5001 24.375C32.5001 23.4813 31.7688 22.75 30.8751 22.75C29.9813 22.75 29.2501 23.4813 29.2501 24.375C29.2501 25.2687 29.9813 26 30.8751 26C31.7688 26 32.5001 25.2687 32.5001 24.375ZM32.5001 11.375H17.8751V17.875H32.5001V11.375ZM11.3751 15.4375C11.3263 13.195 9.47381 11.375 7.23131 11.4563C6.15394 11.478 5.12932 11.9268 4.38273 12.7038C3.63615 13.4809 3.22873 14.5226 3.25006 15.6C3.27129 16.5217 3.60414 17.409 4.19435 18.1173C4.78456 18.8255 5.59731 19.3129 6.50006 19.5V32.5H8.12506V19.5C10.0426 19.11 11.3751 17.4038 11.3751 15.4375Z" fill="#313131"></path>
    </symbol>

    <%-- viewBox="0 0 42 43" --%>
    <symbol id="seating-icon">
        <path d="M10.5 39V33.75H7V39H3.5V25C3.5 24.5359 3.68437 24.0907 4.01256 23.7625C4.34075 23.4344 4.78587 23.25 5.25 23.25C5.71413 23.25 6.15925 23.4344 6.48744 23.7625C6.81563 24.0907 7 24.5359 7 25V30.25H12.25C12.7141 30.25 13.1592 30.4344 13.4874 30.7625C13.8156 31.0907 14 31.5359 14 32V39M35 19.75V39H33.25V19.75C32.1877 19.5331 31.2438 18.9296 30.6012 18.0563C29.9586 17.1831 29.6632 16.1024 29.7722 15.0237C29.8811 13.945 30.3867 12.9451 31.191 12.218C31.9952 11.4909 33.0408 11.0884 34.125 11.0884C35.2092 11.0884 36.2548 11.4909 37.059 12.218C37.8633 12.9451 38.3689 13.945 38.4778 15.0237C38.5868 16.1024 38.2914 17.1831 37.6488 18.0563C37.0062 18.9296 36.0623 19.5331 35 19.75ZM26.25 20.7125V28.5H24.5V39H21.875V30.25H20.125V39H17.5V28.5H15.75V20.625C15.75 19.9288 16.0266 19.2611 16.5188 18.7688C17.0111 18.2765 17.6788 18 18.375 18H23.625C24.3212 18 24.9889 18.2765 25.4812 18.7688C25.9734 19.2611 26.25 19.9288 26.25 20.625M21 11.9625C20.4772 11.9628 19.9663 12.1192 19.5329 12.4117C19.0996 12.7042 18.7634 13.1194 18.5676 13.6042C18.3717 14.089 18.3251 14.6212 18.4337 15.1326C18.5423 15.6441 18.8011 16.1114 19.177 16.4748C19.5529 16.8382 20.0288 17.0811 20.5436 17.1723C21.0585 17.2634 21.5888 17.1988 22.0667 16.9866C22.5445 16.7745 22.9481 16.4245 23.2258 15.9814C23.5034 15.5384 23.6424 15.0225 23.625 14.5C23.625 13.8038 23.3484 13.1361 22.8562 12.6438C22.3639 12.1515 21.6962 11.875 21 11.875V11.9625Z" fill="#313131"></path>
    </symbol>

    <%-- viewBox="0 0 24 25" --%>
    <symbol id="trashcan-icon">
        <g fill="transparent">
            <path d="M3 4.5L5.303 18.576C5.4223 19.3053 5.74129 19.9873 6.22459 20.5463C6.7079 21.1053 7.33661 21.5195 8.041 21.743L8.369 21.847C10.7316 22.597 13.2684 22.597 15.631 21.847L15.959 21.743C16.6633 21.5196 17.2919 21.1056 17.7752 20.5467C18.2585 19.9879 18.5775 19.3061 18.697 18.577L21 4.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M12 6.5C16.9706 6.5 21 5.60457 21 4.5C21 3.39543 16.9706 2.5 12 2.5C7.02944 2.5 3 3.39543 3 4.5C3 5.60457 7.02944 6.5 12 6.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>
    </symbol>


    <%-- viewBox="0 0 40 40" --%>
    <symbol id="location-icon">
        <path d="M20.0002 19.1667C18.8951 19.1667 17.8353 18.7277 17.0539 17.9463C16.2725 17.1649 15.8335 16.1051 15.8335 15C15.8335 13.895 16.2725 12.8352 17.0539 12.0538C17.8353 11.2724 18.8951 10.8334 20.0002 10.8334C21.1052 10.8334 22.165 11.2724 22.9464 12.0538C23.7278 12.8352 24.1668 13.895 24.1668 15C24.1668 15.5472 24.0591 16.089 23.8497 16.5946C23.6403 17.1001 23.3334 17.5594 22.9464 17.9463C22.5595 18.3332 22.1002 18.6401 21.5947 18.8495C21.0892 19.0589 20.5473 19.1667 20.0002 19.1667ZM20.0002 3.33337C16.906 3.33337 13.9385 4.56254 11.7506 6.75046C9.56266 8.93839 8.3335 11.9058 8.3335 15C8.3335 23.75 20.0002 36.6667 20.0002 36.6667C20.0002 36.6667 31.6668 23.75 31.6668 15C31.6668 11.9058 30.4377 8.93839 28.2497 6.75046C26.0618 4.56254 23.0944 3.33337 20.0002 3.33337Z" fill="white"></path>
    </symbol>

    <%-- viewBox="0 0 36 36" --%>
    <symbol id="info-icon">
        <path d="M16.5 16.47C16.5 16.0722 16.658 15.6907 16.9393 15.4094C17.2206 15.1281 17.6022 14.97 18 14.97C18.3978 14.97 18.7794 15.1281 19.0607 15.4094C19.342 15.6907 19.5 16.0722 19.5 16.47V25.47C19.5 25.8679 19.342 26.2494 19.0607 26.5307C18.7794 26.812 18.3978 26.97 18 26.97C17.6022 26.97 17.2206 26.812 16.9393 26.5307C16.658 26.2494 16.5 25.8679 16.5 25.47V16.47ZM18 9.07654C17.6022 9.07654 17.2206 9.23457 16.9393 9.51588C16.658 9.79718 16.5 10.1787 16.5 10.5765C16.5 10.9744 16.658 11.3559 16.9393 11.6372C17.2206 11.9185 17.6022 12.0765 18 12.0765C18.3978 12.0765 18.7794 11.9185 19.0607 11.6372C19.342 11.3559 19.5 10.9744 19.5 10.5765C19.5 10.1787 19.342 9.79718 19.0607 9.51588C18.7794 9.23457 18.3978 9.07654 18 9.07654Z" fill="white"></path>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M18 3C9.7155 3 3 9.7155 3 18C3 26.2845 9.7155 33 18 33C26.2845 33 33 26.2845 33 18C33 9.7155 26.2845 3 18 3ZM6 18C6 21.1826 7.26428 24.2348 9.51472 26.4853C11.7652 28.7357 14.8174 30 18 30C21.1826 30 24.2348 28.7357 26.4853 26.4853C28.7357 24.2348 30 21.1826 30 18C30 14.8174 28.7357 11.7652 26.4853 9.51472C24.2348 7.26428 21.1826 6 18 6C14.8174 6 11.7652 7.26428 9.51472 9.51472C7.26428 11.7652 6 14.8174 6 18Z" fill="white"></path>
    </symbol>

    <%-- viewBox="0 0 44 44" --%>
    <symbol id="stats-icon">
        <path d="M38.5 33.6875H37.8125V6.875C37.8125 6.32799 37.5952 5.80339 37.2084 5.41659C36.8216 5.0298 36.297 4.8125 35.75 4.8125H26.125C25.578 4.8125 25.0534 5.0298 24.6666 5.41659C24.2798 5.80339 24.0625 6.32799 24.0625 6.875V13.0625H16.5C15.953 13.0625 15.4284 13.2798 15.0416 13.6666C14.6548 14.0534 14.4375 14.578 14.4375 15.125V21.3125H8.25C7.70299 21.3125 7.17839 21.5298 6.79159 21.9166C6.4048 22.3034 6.1875 22.828 6.1875 23.375V33.6875H5.5C4.95299 33.6875 4.42839 33.9048 4.04159 34.2916C3.6548 34.6784 3.4375 35.203 3.4375 35.75C3.4375 36.297 3.6548 36.8216 4.04159 37.2084C4.42839 37.5952 4.95299 37.8125 5.5 37.8125H38.5C39.047 37.8125 39.5716 37.5952 39.9584 37.2084C40.3452 36.8216 40.5625 36.297 40.5625 35.75C40.5625 35.203 40.3452 34.6784 39.9584 34.2916C39.5716 33.9048 39.047 33.6875 38.5 33.6875ZM28.1875 8.9375H33.6875V33.6875H28.1875V8.9375ZM18.5625 17.1875H24.0625V33.6875H18.5625V17.1875ZM10.3125 25.4375H14.4375V33.6875H10.3125V25.4375Z" fill="white"></path>
    </symbol>

    <%-- viewBox="0 0 53 53" --%>
    <symbol id="tips-icon">
        <path d="M21.3391 37.5417H31.6587M26.5 6.625V8.83333M40.5538 12.4462L38.9925 14.0075M46.375 26.5H44.1667M8.83333 26.5H6.625M14.0075 14.0075L12.4462 12.4462M18.6913 34.3087C17.1474 32.7643 16.0961 30.7969 15.6703 28.6551C15.2445 26.5133 15.4633 24.2934 16.2991 22.2759C17.1349 20.2585 18.5502 18.5342 20.3659 17.321C22.1816 16.1079 24.3163 15.4604 26.5 15.4604C28.6837 15.4604 30.8184 16.1079 32.6341 17.321C34.4498 18.5342 35.8651 20.2585 36.7009 22.2759C37.5367 24.2934 37.7555 26.5133 37.3297 28.6551C36.9039 30.7969 35.8526 32.7643 34.3087 34.3087L33.0985 35.5166C32.4066 36.2086 31.8579 37.0301 31.4835 37.9342C31.1092 38.8382 30.9165 39.8072 30.9167 40.7857V41.9583C30.9167 43.1297 30.4513 44.2531 29.6231 45.0814C28.7948 45.9097 27.6714 46.375 26.5 46.375C25.3286 46.375 24.2052 45.9097 23.3769 45.0814C22.5487 44.2531 22.0833 43.1297 22.0833 41.9583V40.7857C22.0833 38.8092 21.2972 36.9123 19.9015 35.5166L18.6913 34.3087Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
    </symbol>

    <%-- viewBox="0 0 77 77" --%>
    <symbol id="arrow-icon">
        <rect x="1.5" y="1.5" width="74" height="74" rx="37"></rect>
        <path class="arrow-icon-background" d="M40.5057 51L38.3182 48.8409L47.3239 39.8352H24V36.7102H47.3239L38.3182 27.733L40.5057 25.5455L53.233 38.2727L40.5057 51Z" fill="white"></path>
    </symbol>

</svg>

<%-- Toolbars --%>
<div class="actions-toolbar-overlay-container">
    <div class="actions-toolbar-overlay">
        <div class="actions-toolbar">
            <div class="actions-toolbar-item show-labels-toolbar">
                <div class="actions-toolbar-item-icon">

                </div>
                <div class="actions-toolbar-item-text">Label</div>
            </div>
            <div class="actions-toolbar-item save-image">
                <div class="actions-toolbar-item-icon">

                </div>
                <div class="actions-toolbar-item-text">Analyze Image</div>
            </div>
            <div class="actions-toolbar-item previous-location" style="margin-left: 50px;">
                <div class="actions-toolbar-item-icon">

                </div>
                <div class="actions-toolbar-item-text">Previous</div>
            </div>
            <div class="actions-toolbar-item next-location">
                <div class="actions-toolbar-item-icon">

                </div>
                <div class="actions-toolbar-item-text">Next</div>
            </div>

        </div>
    </div>
</div>

<div class="panorama-container">

    <div class="label-toolbar-overlay-container" style="display: none;">
        <div class="label-toolbar-overlay">
            <div class="label-toolbar">

                <div class="label-group-container template">
                    <div class="label-group-title">AI Supported Labels</div>
                    <div class="label-group-content">
                        <div class="label-toolbar-item place-label template" data-label-type="">
                            <div class="label-toolbar-item-icon">
                                <svg viewBox="0 0 24 24">
                                    <use href="#tick-icon" class="label-icon"></use>
                                </svg>
                            </div>
                            <div class="label-toolbar-item-text"></div>
                        </div>
                    </div>
                </div>

                <div class="label-toolbar-item go-back" >
                    <div class="label-toolbar-item-icon"></div>
                    <div class="label-toolbar-item-text">Back</div>
                </div>

                <div class="label-toolbar-item stop-labeling">
                    <div class="label-toolbar-item-icon"></div>
                    <div class="label-toolbar-item-text">Done</div>
                </div>

                    <div class="label-toolbar-item next-location-button">
                        <div class="label-toolbar-item-icon next-location-button-icon">
                            <svg viewBox="0 0 77 77">
                                <use href="#arrow-icon"></use>
                            </svg>
                        </div>
                        <div class="label-toolbar-item-text next-location-button-title">Next Stop</div>
                    </div>
            </div>


        </div>
    </div>

    <div class="object-boundary template">
        <div class="object-boundary-label">
            <div class="object-boundary-label-text"></div>
            <div class="object-boundary-correct">
                <svg viewBox="0 0 24 24">
                    <use href="#tick-icon" class="object-boundary-label-icon"></use>
                </svg>
            </div>
            <div class="object-boundary-incorrect">
                <svg viewBox="1 1 22 22">
                    <use href="#close-icon" class="object-boundary-label-icon"></use>
                </svg>
            </div>
        </div>
<%--        <div class="object-boundary-center marker"></div>--%>
    </div>
    <div id="panorama"></div>
    <div class="marker template">
        <div class="marker-icon-container" style="display: none;">
            <svg viewBox="0 0 0 0">
                <use href="#shelter-icon" class="marker-icon"></use>
            </svg>
        </div>
    </div>
    <div class="overlay"></div>
    <div class="mode-indicator"></div>
    <div class="pano-mid-x"></div>
    <div class="pano-mid-y"></div>

    <div class="status-indicator">Move the pano to start detecting</div>

</div>

<div class="dummy-image-container" style="position: absolute; overflow: hidden; pointer-events: none; z-index: -1;">
    <img src="" width="100%" height="100%" class="dummy-image" style="top: 0; left: 0;">
    <div class="dummy-marker template"></div>
</div>

<div class="mini-label-icon-for-cursor">
    <svg viewBox="0 0 24 24">
        <use href="#tick-icon" class="mini-label-icon"></use>
    </svg>
</div>

<%--<img src="sv.jpg" width="100%" style="z-index: 100;" class="abcd">--%>

<div class="mission-stats-panel-container">

    <div class="mission-stats-panel-title">
        <div class="mission-stats-panel-title-text">Mission Completed!</div>
<%--        <div class="mission-stats-panel-title-icon">--%>
<%--            <svg viewBox="0 0 24 24">--%>
<%--                <use href="#tick-icon"></use>--%>
<%--            </svg>--%>
<%--        </div>--%>
    </div>

    <div class="mission-stats-content">
        <div class="mission-target-container">
            <div class="mission-target-title">Target:&nbsp;</div>
            <div class="mission-target-value"></div>
        </div>
        <div class="mission-progress-container">
            <div class="mission-progress-title">Current:&nbsp;</div>
            <div class="mission-progress-value"></div>
        </div>
    </div>
</div>

<%--<div class="sidebar collapsed">--%>
<%--    <div class="sidebar-title">StreetscapeCV</div>--%>
<%--    <div class="sidebar-content">--%>
<%--&lt;%&ndash;        <div class="sidebar-section mission-location-container">&ndash;%&gt;--%>
<%--&lt;%&ndash;            <div class="sidebar-icon mission-location-icon">&ndash;%&gt;--%>
<%--&lt;%&ndash;                <svg viewBox="0 0 40 40">&ndash;%&gt;--%>
<%--&lt;%&ndash;                    <use href="#location-icon"></use>&ndash;%&gt;--%>
<%--&lt;%&ndash;                </svg>&ndash;%&gt;--%>
<%--&lt;%&ndash;            </div>&ndash;%&gt;--%>
<%--&lt;%&ndash;            <div class="sidebar-section-title mission-location-title">Mission Location</div>&ndash;%&gt;--%>
<%--&lt;%&ndash;        </div>&ndash;%&gt;--%>
<%--&lt;%&ndash;        <div class="sidebar-section mission-progress-container">&ndash;%&gt;--%>
<%--&lt;%&ndash;            <div class="mission-progress-indicator"></div>&ndash;%&gt;--%>
<%--&lt;%&ndash;        </div>&ndash;%&gt;--%>
<%--&lt;%&ndash;        <div class="sidebar-section mission-information-container">&ndash;%&gt;--%>
<%--&lt;%&ndash;            <div class="sidebar-icon mission-information-icon">&ndash;%&gt;--%>
<%--&lt;%&ndash;                <svg viewBox="0 0 36 36">&ndash;%&gt;--%>
<%--&lt;%&ndash;                    <use href="#info-icon"></use>&ndash;%&gt;--%>
<%--&lt;%&ndash;                </svg>&ndash;%&gt;--%>
<%--&lt;%&ndash;            </div>&ndash;%&gt;--%>
<%--&lt;%&ndash;            <div class="sidebar-section-title mission-information-title">Mission Information</div>&ndash;%&gt;--%>
<%--&lt;%&ndash;        </div>&ndash;%&gt;--%>
<%--&lt;%&ndash;        <div class="sidebar-section mission-stats-container">&ndash;%&gt;--%>
<%--&lt;%&ndash;            <div class="sidebar-icon mission-stats-icon">&ndash;%&gt;--%>
<%--&lt;%&ndash;                <svg viewBox="0 0 44 44">&ndash;%&gt;--%>
<%--&lt;%&ndash;                    <use href="#stats-icon"></use>&ndash;%&gt;--%>
<%--&lt;%&ndash;                </svg>&ndash;%&gt;--%>
<%--&lt;%&ndash;            </div>&ndash;%&gt;--%>
<%--&lt;%&ndash;            <div class="sidebar-section-title mission-stats-title">Mission Stats</div>&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;            <div class="sidebar-section-content mission-stats-content">&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                <div class="mission-stats-item">&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-title">Total Images</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-value">0</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                </div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                <div class="mission-stats-item">&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-title">Total Labels</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-value">0</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                </div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                <div class="mission-stats-item">&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-title">Total Labels Correct</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-value">0</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                </div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                <div class="mission-stats-item">&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-title">Total Labels Incorrect</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-value">0</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                </div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                <div class="mission-stats-item">&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-title">Total Labels Skipped</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                    <div class="mission-stats-item-value">0</div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;&lt;%&ndash;                </div>&ndash;%&gt;&ndash;%&gt;--%>
<%--&lt;%&ndash;        </div>&ndash;%&gt;--%>
<%--&lt;%&ndash;        <div class="sidebar-section tips-container">&ndash;%&gt;--%>
<%--&lt;%&ndash;            <div class="sidebar-icon tips-icon">&ndash;%&gt;--%>
<%--&lt;%&ndash;                <svg viewBox="0 0 53 53">&ndash;%&gt;--%>
<%--&lt;%&ndash;                    <use href="#tips-icon"></use>&ndash;%&gt;--%>
<%--&lt;%&ndash;                </svg>&ndash;%&gt;--%>
<%--&lt;%&ndash;            </div>&ndash;%&gt;--%>
<%--&lt;%&ndash;            <div class="sidebar-section-title tips-title">Tips</div>&ndash;%&gt;--%>
<%--&lt;%&ndash;        </div>&ndash;%&gt;--%>

<%--        <div class="sidebar-section next-location-button">--%>
<%--            <div class="sidebar-section-title next-location-button-title">Next Stop</div>--%>
<%--            <div class="sidebar-icon next-location-button-icon">--%>
<%--                <svg viewBox="0 0 77 77">--%>
<%--                    <use href="#arrow-icon"></use>--%>
<%--                </svg>--%>
<%--            </div>--%>
<%--        </div>--%>

<%--        <div class="sidebar-section submit-button">--%>
<%--            <div class="sidebar-section-title submit-button-title">Done</div>--%>
<%--        </div>--%>
<%--    </div>--%>
<%--    <div class="toggle-sidebar-button"></div>--%>
<%--</div>--%>

<%--<div class="screen-capture">--%>
<%--    Take a screenshot--%>
<%--</div>--%>

<script>
    var panorama;
    function initMap() {

        HTMLCanvasElement.prototype.getContext = function(origFn) {
            return function(type, attributes) {
                if (type === 'webgl') {
                    attributes = Object.assign({}, attributes, {
                        preserveDrawingBuffer: true,
                    });
                }
                return origFn.call(this, type, attributes);
            };
        }(HTMLCanvasElement.prototype.getContext);

        // const latLng = "47.6327022,-122.2279419";
        // const latLng = "47.6637776,-122.3008794";
        // const latLng = "47.6627831,-122.3008315";
        // const latLng = "47.66853,-122.290514";
        // const latLng = "47.6572767,-122.3046887";
        // const latLng = "47.6539783,-122.3051593";
        // const latLng = "47.6523437,-122.3062897";
        const latLng = "47.6557727,-122.3120149";
        // const latLng = "47.6593773,-122.3119228";
        // const latLng = "47.6493394226547, -122.30513426461609";

        console.log(latLng.split(',')[0] + ' : ' + latLng.split(',')[1]);

        panorama = new google.maps.StreetViewPanorama(
            document.getElementById('panorama'),
        {
                position: {lat: parseFloat(latLng.split(',')[0]), lng: parseFloat(latLng.split(',')[1])},
                pov: {heading: 0, pitch: -10},
                zoom: 1
            }, function () {
                panorama.setPov(panorama.getPhotographerPov());
            });
    }
</script>
<script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBmlVct28ooFui9xThE2ZSgugQ9gEI2cZo&callback=initMap">
</script>
</body>
</html>
