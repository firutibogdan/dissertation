module Main exposing (..)

import Browser
import Markdown
import Markdown.Config exposing (Options, HtmlOption, defaultOptions)
import Http exposing (..)
import Html exposing (Html, Attribute, div, input, text, button, object, iframe)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Json.Encode as JE
import String exposing (fromInt)


main : Program () Model Msg
main = Browser.element { init = init, update = update, view = view, subscriptions = \_ -> Sub.none}

type alias Model =
    {
        username : String,
        password : String,
        path : String,
        result : String
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ({
        username = "",
        password = "",
        path = "",
        result = ""
    }, Cmd.none)


type Msg = Username String | Password String | Path String | Login | XSS | Traversal | HttpRes (Result Http.Error String)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Username value ->
            ({ model | username = value }, Cmd.none)
        Password value ->
            ({ model | password = value }, Cmd.none)
        Path value ->
            ({ model | path = value }, Cmd.none)
        Login -> (model, tryLogin model.username model.password)
        XSS -> (model, tryXSS)
        Traversal -> (model, tryPathTraversal model.path)
        HttpRes (Ok ret) -> ({ model | result = ret, username = "", password = "", path = ""}, Cmd.none)
        HttpRes (Err ret) -> ({ model | result = (errorToString ret), username = "", password = "", path = ""}, Cmd.none)
tryLogin : String -> String -> Cmd Msg
tryLogin username password = Http.post { url = "/api/login", body = (Http.jsonBody (JE.object [ ( "username", JE.string username ), ( "password", JE.string password ) ])), expect = Http.expectString HttpRes }

tryXSS : Cmd Msg
tryXSS = Http.get { url = "/api/show_xss", expect = Http.expectString HttpRes }

tryPathTraversal : String -> Cmd Msg
tryPathTraversal path = Http.post { url = "/api/path_traversal", body = (Http.jsonBody (JE.object [ ( "path", JE.string path )])), expect = Http.expectString HttpRes }

errorToString : Http.Error -> String
errorToString error =
    case error of
        Http.BadUrl url ->
            "The URL " ++ url ++ " was invalid"
        Http.Timeout ->
            "Unable to reach the server, try again"
        Http.NetworkError ->
            "Unable to reach the server, check your network connection"
        Http.BadStatus 500 ->
            "The server had a problem, try again later"
        Http.BadStatus 400 ->
            "Verify your information and try again"
        Http.BadStatus x ->
            "Unknown error" ++ (fromInt x)
        Http.BadBody errorMessage ->
            errorMessage

customOptions : Options
customOptions =
    { defaultOptions
    |   rawHtml = Markdown.Config.ParseUnsafe
    }

view : Model -> Html Msg
view model =
  div []
    [
    div [] [ text "Login" ],
    div [] [input [ type_ "text", placeholder "username", value model.username, onInput Username ] [],
            input [ type_ "password", placeholder "password", value model.password, onInput Password ] []],
    div [] [ button [ onClick Login ] [ text "Login" ]],
    div [] [input [ placeholder "path", value model.path, onInput Path ] []],
    div [] [ button [ onClick XSS ] [ text "XSS hack" ],
             button [ onClick Traversal ] [ text "Path traversal hack" ]],
    div [] <| Markdown.toHtml (Just customOptions) model.result
    ]