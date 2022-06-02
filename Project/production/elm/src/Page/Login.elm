module Page.Login exposing (..)

import Browser
import Markdown
import Markdown.Config exposing (Options, HtmlOption, defaultOptions)
import Http exposing (..)
import Html exposing (Html, Attribute, div, input, text, button, object, iframe)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Json.Encode as JE
import String exposing (fromInt)
import Router exposing (Layout)


type alias Model =
    {
        username : String,
        password : String,

        result : String
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ({
        username = "",
        password = "",

        result = ""
    }, Cmd.none)


type Msg = Username String | Password String |
            Login | HttpRes (Result Http.Error String)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Username value ->
            ({ model | username = value }, Cmd.none)
        Password value ->
            ({ model | password = value }, Cmd.none)
        Login -> (model, tryLogin model.username model.password)
        HttpRes (Ok ret) -> ({ model | result = ret, username = "", password = ""}, Cmd.none)
        HttpRes (Err ret) -> ({ model | result = (errorToString ret), username = "", password = ""}, Cmd.none)
tryLogin : String -> String -> Cmd Msg
tryLogin username password = Http.post { url = "/api/login", body = (Http.jsonBody (JE.object [ ( "username", JE.string username ), ( "password", JE.string password ) ])), expect = Http.expectString HttpRes }

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

view : Model -> Layout Msg
view model = {
    title = Just "Login",
    attrs = [],
    main = [
            div [] [
                div [] [
                            div [] [ text "Login" ],
                            div [] [input [ type_ "text", placeholder "username", value model.username, onInput Username ] [],
                                    input [ type_ "password", placeholder "password", value model.password, onInput Password ] []
                                    ],
                            div [] [ button [ onClick Login ] [ text "Login" ]]
                        ],
            div [] <| Markdown.toHtml (Just customOptions) model.result
            ]
        ]
    }