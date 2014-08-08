
$(function(){
    $('#items').on('click', function(e){
        var t = e.target;
        if($(t).hasClass('rmvIt')){
            $(t).closest('tr').fadeOut(500, function(){
                $(this).remove();
                if($('.beenRatedRank').length == 0) {$('.table').fadeOut(500)};
            })
        }
    });

    $('.github').click(function(){
        window.location = 'https://github.com/steveperrito/list_rank';
    });

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

    $('.cloneBtn').click(function(e){
        e.preventDefault();

        var cloneMe = $('.cloneMeSon:eq(0)');
        var cloneMeRanking = $('.stars:eq(0)').clone();
        var appendClone = $('.appendClone');
        var appendData = cloneMe.clone();
        var listItem = $('.listItem').val();

        if (listItem === '' || $('.beenRated').length == 0) {
            alert('What the hell! Add a list item Or at least Rank it!');
        } else {
            $('.table').fadeIn(500);
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

    });
});
