import json

from SPARQLWrapper import JSON, SPARQLWrapper

QUERY = """
select distinct
    str(?dish) as ?dish, (GROUP_CONCAT(?country;SEPARATOR="|") as ?countries), (GROUP_CONCAT(?ingredient;SEPARATOR="|") AS ?ingredients)
where {
    ?r a <http://dbpedia.org/ontology/Food> .
    ?r <http://www.w3.org/2000/01/rdf-schema#label> ?dish .
    ?r <http://dbpedia.org/ontology/country> ?c .
    ?c <http://www.w3.org/2000/01/rdf-schema#label> ?country .
    ?r <http://dbpedia.org/ontology/ingredient> ?i .
    ?i <http://www.w3.org/2000/01/rdf-schema#label> ?ingredient .
    FILTER(langMatches(lang(?dish), "en"))
    FILTER(langMatches(lang(?country), "en"))
    FILTER(langMatches(lang(?ingredient), "en"))
}
"""

sparql = SPARQLWrapper("http://dbpedia.org/sparql")
sparql.setQuery(QUERY)
sparql.setReturnFormat(JSON)
ret = sparql.query().convert()

foods = {}
for row in ret["results"]["bindings"]:
    title, origins, ingredients = (
        row["dish"]["value"],
        set(row["countries"]["value"].split("|")),
        set(row["ingredients"]["value"].split("|")),
    )
    ingredients = [i.replace(" as food", "") for i in ingredients]
    if title and len(origins) > 0 and len(ingredients) > 2:
        foods[title] = dict(
            title=title,
            origins=sorted(origins),
            ingredients=sorted(ingredients),
        )

with open("foods.json", "w") as f:
    json.dump(foods, f)
