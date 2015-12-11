
var EOL = new Object(), b;

(function() {
  
  // EOL Object - for Encyclopedia of life
  
  // === CONSTANTS ===
  
  // Misc
  
  var eolUrlRoot = 'http://eol.org/',
      eol_id_for_plants = 281;
  
  // URLs
  
  EOL.url = {
  	root: eolUrlRoot,
  	page: function (eolId) { return eolUrlRoot + 'api/pages/1.0/' + eolId + '.json?callback=?' },
  	pageForHumans: function (eolId) { return eolUrlRoot + 'pages/' + eolId + '/overview' },
  	search: eolUrlRoot + '/api/search/1.0.json?callback=?'
  };
  
  // Data types
  
  EOL.dataType = {
  	text:  'http://purl.org/dc/dcmitype/Text',
  	image: 'http://purl.org/dc/dcmitype/StillImage'
  }
  
  // Languages
  
  EOL.language = { english : 'en' }
  
  // === FUNCTIONS ===
  
  // Search: given a taxonomic string, search EOL and update display
  // TODO: EOL should NOT be updating the display - that's somebody else's job ...
  
  EOL.search = function (searchString) {
    
    console.log('Looking for ' + searchString);
  	var successFunc = function (searchResults) {
  		
  		console.log(searchResults);
  		
  		if (searchResults.totalResults !== 0) {
  			EOL.getLifeReference(searchResults.results[0].id);
  		} else {
  
  			// If nothing found, lop off last term and try again (or die if nothing left)
  
  			var higherOrder = searchString.replace(/\s+\w+\s*$/, '');
  
  			if (higherOrder === '' || higherOrder === searchString) {
  				$('#plant-name').text('Nothing found for ' + searchString);
  				$('#plant-aka').text('');
  				$('#plant-description').html('');
  			} else {
  				EOL.search(higherOrder);
  			}
  		}
  	}
  
  	$.ajax({
  	  dataType: 'json',
  	  url: EOL.url.search,
  	  data: {
  	  	q: searchString.replace(/\s+/g, '+'),
  	    filter_by_taxon_concept_id: eol_id_for_plants
  	  	// cache_ttl : null
  	  },
  	  success: successFunc
  	});
  }
  
  // Suck term in from HTML form and search
  
  EOL.getInfo = function () {
  	
  	EOL.getLifeReference($('#n').get(0).value);
  
  }
  
  // Given a numeric EOL ID, find an organism's data
  // and load it into the page
  
  EOL.getLifeReference = function (eolId) {
  
  	$.ajax({
  	  dataType: 'json',
  	  url: EOL.url.page(eolId),
  	  data: {
  		images : null,
  		videos : null,
  		sounds : null,
  		maps : null,
  		text : null,
  		iucn : 'false',
  		subjects : 'overview',
  		licenses : 'all', 
  		details : 'true',
  		common_names : 'true',
  		synonyms : 'true',
  		references : 'true',
  		vetted : 0,
  		cache_ttl : null
  	  },
  	  success: function (d) {
  
  	  	b = d;
  
  	  	var data = {};
  
  	  	data.name = d.scientificName;
  
        data.eolPageUrl = EOL.url.pageForHumans(d.identifier);
        
  	  	data.akaNames = d.vernacularNames
          				  		 .filter( function (vn) { return (vn.language === EOL.language.english ) })
          				  		 .map(    function (vn) { return vn.vernacularName });
  
    		data.description = 
    			d.dataObjects
    			 .filter(function (vn) { 
    				return (vn.dataType === EOL.dataType.text
    				&& vn.language === EOL.language.english
    				&& vn.description !== undefined )
    			 })
    			 .map(function (vn) { return vn.description })
    			 .join('<br />');
  
        var imgReferences =
    			d.dataObjects
    			 .filter(function (vn) { 
    				return (vn.dataType === EOL.dataType.image)
    			 });
    			 
        console.log("REFS: "); console.log(imgReferences);
  
        if (imgReferences.length > 0) {
          var i = imgReferences[0];
          console.log('I: ');console.log(i);
          data.imgUrl = (i.eolMediaURL !== undefined && i.eolMediaURL !== '') 
                        ? i.eolMediaURL 
                        : i.mediaURL;
        } else { data.imgUrl = null }
  
    		data.title  = data.name;
  	  	data.title2 = data.akaNames.join(', ');
  	  	
        console.log("PARSED DATA: ");
        console.log(data);
        
    		$('#plant-name').text(data.title);
    		$('#plant-aka').text(data.title2);
    		$('#plant-description').html(data.description);
    		// $('#plant-image').attr('src', data.imgUrl);
    		$('#plant-image').css('background-image', 'url("' + data.imgUrl + '")')
    		$('#plant-details-qr').qrcode({
          "width": 70,
          "height": 70,
          "color": "#fff",
          "text": EOL.url.pageForHumans(eolId)
        });
  		
  		/* SPLIT SENTENCES INTO PARAGRAPHS
  		$('#plant-description').html(
  			data.description.split(/\.(\s+|&nbsp;)(?=[A-Z])/)
  							.map(function(p) { return '<p>' + p + '</p>' })
  							.join('') );
  		*/
  
  		return true;
  
  		// - - - - - - - - - - 
  
  	  	if (false) {   // DISABLED
  
  		  	// Get name and put on page
  
  		  	$('#plant-name').text(d.scientificName);
  
  		  	// Get vernacular names and put on page
  
  		  	$('#plant-aka').text(
  		  		'Also known as ' +
  		  		d.vernacularNames
  		  		 .filter(function (vn) { return (vn.language === EOL.language.english ) })
  		  		 .map(function (vn) { return vn.vernacularName })
  		  		 .join(', ')
  		  	);
  
  
  
  		  	// Get description and put on page
  		  	// TODO: if no description found, look to higher order and grab that description ...
  		  	//   see http://eol.org/api/docs/hierarchy_entries
  		  	//   hierarchies have their own ID - so to find the parent you need to specify 
  		  	//   the ID of the organism as well as the hierarchical system you're using
  
  		  	/*
  
  
  			take d.taxonConcepts and look for d.taxonConcepts[0].identifier 
  			then plug it into http://eol.org/api/hierarchy_entries/1.0/<IDENTIFIER>.json?common_names=false&synonyms=true&cache_ttl=
  
  			$.ajax({ 
  				dataType: 'json', 
  				url: 'http://eol.org/api/hierarchy_entries/1.0/' + tcId + '.json?callback=?&common_names=false&synonyms=true&cache_ttl=', 
  				success: function (h) {  
  					var parentId = h.ancestors[h.ancestors.length - 1].taxonConceptID;
  					var parentUrl = EOL.url.page(parentId);
  
  				} 
  			});
  
  			then look in response for r.ancestors
  
  		  	*/
  
  		  	$('#plant-description').html(
  		  		d.dataObjects
  		  		 .filter(function (vn) { 
  		  		 	return (vn.dataType === EOL.dataType.text
  		  		 		 && vn.language === EOL.language.english
  		  		 		 && vn.description !== undefined )
  		  		 })
  		  		 .map(function (vn) { return vn.description })
  		  		 .join('<br />')
  		  	);
  		  }
  		}
  	});
  }
})();
