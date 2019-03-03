/**
 * Created by Nicholas on 7/16/2016.
 */
$(document).ready(() => {
    $(".searchTerm").submit(function () {
        $(".contentBox").remove();
        let url = $(this).serialize();
        const num = $("#numberInputID").val();
        url = url.split("=").pop();
        url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=&list=search&titles=&srsearch=${url}&srprop=titlesnippet%7Csnippet&srlimit=${num}&prop=info&inprop=url&callback=?`;
        $("#sliderInstructions").remove();
        $("#searchInstructions").remove();

        $(".searchbox").animate({ marginTop: 20 }, 200).css("height", "150px");

        $.getJSON(url, (display) => {
            for (let i = 0; i < num; i++) {
                $(".searchbox").after(`${"" + 
			"<div class=\"contentBox\">" +
					"<a href=\"https://en.wikipedia.org/?curid="}${display.query.search[i].pageid}\" class><div class=\"title\">${display.query.search[i].title}</div>` +
					`<div class="snippet">${display.query.search[i].snippet}</div>` +
					"</a>" +
					"</div>");
            }
        });
    });
});
