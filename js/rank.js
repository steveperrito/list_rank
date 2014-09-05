
$(function(){
    $('.github').click(function(){
        window.location = 'https://github.com/steveperrito/list_rank';
    });
});

$(function(){
    setListeners();
    var getTheStored = JSON.parse(localStorage.getItem('savedList'));
    var toLocalStorage = [];

    if (getTheStored != null && getTheStored.length >=1){
        toLocalStorage = getTheStored;
        toLocalStorage.forEach(function(obj){
            buildSavedItems(obj);
        });
    } else {
        toLocalStorage = [];
    }

    var fixHelper = function(e, ui) {
        ui.children().each(function() {
            $(this).width($(this).width());
        });
        return ui;
    };

    $('.appendClone').sortable({
        helper: fixHelper,
        axis: "y",
        containment: "parent",
        handle: ".glyphicon-sort",
        revert: false,
        tolerance: "pointer",
        update: function() {
            var newOrder = [];
            $('tr[data-guid]').each(function(){
                var guid = $(this).attr('data-guid');
                newOrder.push(guid);
            });
            newOrder.forEach(function(guid){
                toLocalStorage.forEach(function(listItem){
                    if(guid == listItem.id){
                        listItem.sortOrder = newOrder.indexOf(guid);
                    }
                })
            });
            toLocalStorage.sort(function(a,b){
                return a.sortOrder - b.sortOrder;
            });
            storeItBaby(toLocalStorage);
        }
    }).disableSelection();

    $('#items').on('click', function(e){
        var t = e.target;
        if($(t).hasClass('rmvIt')){
            $(t).closest('tr').fadeOut(500, function(){
                var thisTR = $(this);
                toLocalStorage.forEach(function(e){
                    if(thisTR.attr('data-guid') == e.id){
                        var indexOfAry = toLocalStorage.indexOf(e);
                        toLocalStorage.splice(indexOfAry, 1);
                        storeItBaby(toLocalStorage);
                    } else {
                        return 0;
                    }
                });
                $(this).remove();
                if($('.beenRatedRank').length == 0) {$('.table').fadeOut(500)};
            })
        } else if ($(t).hasClass('glyphicon-ok-circle')){
            var thisTR = $(t).closest('tr');
            thisTR.toggleClass('chkedOff');
            toLocalStorage.forEach(function(e){
                if(thisTR.attr('data-guid') == e.id){
                    e.checked = !e.checked;
                    storeItBaby(toLocalStorage);
                } else {
                    return 0;
                }
            });
        } else if ($(t).hasClass('saveList')){
            var thisTd = $(t).closest('td');
            var thisTR = $(t).closest('tr');
            var itemID = thisTR.attr('data-guid');
            var indexOfItem;
            var tdLength = thisTd.width();
            var frmField = $('<input />', {
                'class': 'editable',
                'width': ((tdLength<100)?'100':tdLength)
            });
            var originalText = thisTd.text();
            toLocalStorage.forEach(function(e){
                if(itemID == e.id){
                    indexOfItem = toLocalStorage.indexOf(e);
                }
            });

            frmField.val(originalText);
            thisTd.empty();
            thisTd.append(frmField);
            frmField.select();

            frmField.on('input', function(){
                toLocalStorage[indexOfItem].item = $(this).val();
                storeItBaby(toLocalStorage);
            });
            frmField.on('blur', function(){
                var newText = $(this).val();
                thisTd.empty();
                thisTd.text(newText);
            })
        } else if ($(t).hasClass('nowRated')){
            var parentDiv = $(t).closest('div');
            parentDiv.addClass('stars');
            parentDiv.find('.beenRatedRank').each(function(){
                $(this).addClass('beenRated');
                $(this).removeClass('beenRatedRank');
            });
            parentDiv.find('.nowRated').each(function(){
                $(this).addClass('star wasChanged');
                $(this).removeClass('nowRated');
            });
            setListeners();
        } else if ($(t).hasClass('wasChanged')){
            var closestTR = $(t).closest('tr');
            var closestTD = $(t).closest('td');
            var parentDiv = $(t).closest('div');
            var starRankID = closestTR.attr('data-guid');
            var indexOfStarRank;

            toLocalStorage.forEach(function(e){
                if(starRankID == e.id){
                    indexOfStarRank = toLocalStorage.indexOf(e);
                }
            });

            toLocalStorage[indexOfStarRank].stars = parentDiv.find('.beenRated').length;
            storeItBaby(toLocalStorage);

            parentDiv.find('.wasChanged').each(function(){
                $(this).removeClass('star wasChanged');
            });
            var updatedRank = storeRanking(parentDiv);
            closestTD.empty();
            closestTD.append(updatedRank);
        } else {
            return 0;
        }
    });

    function setListeners(){
        $('.stars').on('mouseover', '.star', function(){
            var el = $(this);
            el.addClass('active');
            el.prevAll('.star').addClass('active');
        });

        $('.stars').on('mouseout', '.star', function() {
            var el = $(this);
            el.removeClass('active');
            el.prevAll('.star').removeClass('active');
        });

        $('.stars').on('click', '.star', function(){
            var el = $(this);
            $('.beenRated').each(function () {
                $(this).removeClass('beenRated');
            });
            $('.star').each(function (){
            });
            el.addClass('beenRated');
            el.prevAll('.star').addClass('beenRated');
        });
    }

    $('.cloneBtn').click(function(e){
        e.preventDefault();

        var cloneMe = $('.cloneMeSon:eq(0)');
        var cloneMeRanking = $('.stars:eq(0)').clone();// The stars that have been ranked
        var appendClone = $('.appendClone');
        var appendData = cloneMe.clone();
        var listItem = $('.listItem').val(); //Item being Ranked
        var storageID = ID();
        var storageObj = {
            id: storageID,
            stars: cloneMeRanking.find('.beenRated').length,
            item: listItem,
            checked: false
        };

        if (listItem === '' || $('.beenRated').length == 0) {
            alert('What the hell! Add a list item Or at least Rank it!');
        } else {
            $('.table').fadeIn(500);
            appendData.find('td.saveList').append(listItem);
            appendData.find('td.saveRank').append(storeRanking(cloneMeRanking));
            appendData.closest('tr').attr('data-guid',storageID);
            appendClone.append(appendData);
            $('.listItem').val('');
            $('.beenRated').each(function () {
                $(this).removeClass('beenRated');
            });
            toLocalStorage.push(storageObj);
            storeItBaby(toLocalStorage);
        }
    });

    function storeRanking(div){
        div.removeClass('stars');
        div.children().each(function() {
            $(this).addClass('nowRated');
        })
        div.find('.beenRated').each(function(){
            $(this).addClass('beenRatedRank');
            $(this).removeClass('beenRated');
            $(this).removeClass('active');
        });
        return div;
    }

    function ID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    function storeItBaby (obj){
        localStorage.setItem('savedList', JSON.stringify(obj));
    }

    function buildSavedItems (obj){
        var cloneMe = $('.cloneMeSon:eq(0)');
        var cloneMeRanking = $('.stars:eq(0)').clone();
        var appendClone = $('.appendClone');
        var appendData = cloneMe.clone();
        var listItem = obj.item;
        var stars = obj.stars;
        var guid = obj.id;
        var starsToBeRanked = cloneMeRanking.children();

        $('.table').fadeIn(500);
        appendData.find('td.saveList').append(listItem);
        cloneMeRanking.closest('div').removeClass('stars');
        starsToBeRanked.each(function(){
            $(this).removeClass('star');
            $(this).addClass('nowRated');
        });
        starsToBeRanked.eq(stars-1).addClass('beenRatedRank');
        starsToBeRanked.eq(stars-1).prevAll().addClass('beenRatedRank');
        appendData.find('td.saveRank').append(cloneMeRanking);
        appendData.closest('tr').attr('data-guid',guid);
        if(obj.checked == true) appendData.closest('tr').addClass('chkedOff');
        appendClone.append(appendData);
    }
});
