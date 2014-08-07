
$(function(){
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

    $('.cloneBtn').click(function(){
        var cloneMe = $('.cloneMeSon:eq(0)');
        var cloneMeRanking = $('.stars:eq(0)').clone();
        var appendClone = $('.appendClone');
        var appendData = cloneMe.clone();
        var listItem = $('.listItem').val();

        if (listItem === '') {
            alert('What the hell! Add a list item. Anything!');
        } else {
            appendData.find('td.saveList').append(listItem);
            appendData.find('td.saveRank').append(storeRanking(cloneMeRanking));
            appendClone.append(appendData);
            $('.listItem').val('');
            $('.beenRated').each(function () {
                $(this).removeClass('beenRated');
            });
        }

        function storeRanking(div){
            //console.log(div.find('.beenRated').length);
            div.find('.beenRated').each(function(){
                $(this).addClass('beenRatedRank');
                $(this).removeClass('beenRated');
                $(this).removeClass('star');
                $(this).removeClass('active');
            });
            return div;
        }

    })
});
