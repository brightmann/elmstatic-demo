module Posts exposing (main)

import Elmstatic exposing (..)
import Html exposing (..)
import Html.Attributes as Attr exposing (alt, attribute, class, href, src)
import Page
import Post


main : Elmstatic.Layout
main =
    let
        postItem post =
            div [ class "post-item" ]
                [ a [ href ("/" ++ post.link) ] [ h2 [] [ text post.title ] ]
                , Post.metadataHtml post
                ]

        postListContent posts =
            if List.isEmpty posts then
                [ text "No posts yet!" ]

            else
                [ div [ Attr.id "post-list" ] (List.map postItem posts)
                , div [ Attr.id "pagination" ] []
                ]

        sortPosts posts =
            List.sortBy .date posts
                |> List.reverse
    in
    Elmstatic.layout Elmstatic.decodePostList <|
        \content ->
            Ok <| Page.layout content.title <| postListContent <| sortPosts content.posts
