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
        username_login : String,
        password_login : String,
        safeness_login : String,

        username_xss : String,
        safeness_xss : String,

        username_lfi : String,
        path_lfi : String,
        safeness_lfi : String,

        result : String
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ({
        username_login = "",
        password_login = "",
        safeness_login = "",

        username_xss = "",
        safeness_xss = "",

        username_lfi = "",
        path_lfi = "",
        safeness_lfi = "",

        result = ""
    }, Cmd.none)


type Msg = UsernameLogin String | PasswordLogin String | SafenessLogin String |
            UsernameXSS String | SafenessXSS String |
            UsernameLFI String | PathLFI String | SafenessLFI String |
            Login | XSS | PathTraversal | HttpRes (Result Http.Error String)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UsernameLogin value ->
            ({ model | username_login = value }, Cmd.none)
        PasswordLogin value ->
            ({ model | password_login = value }, Cmd.none)
        SafenessLogin value ->
            ({ model | safeness_login = value }, Cmd.none)
        UsernameXSS value ->
            ({ model | username_xss = value }, Cmd.none)
        SafenessXSS value ->
            ({ model | safeness_xss = value }, Cmd.none)
        UsernameLFI value ->
            ({ model | username_lfi = value }, Cmd.none)
        PathLFI value ->
            ({ model | path_lfi = value }, Cmd.none)
        SafenessLFI value ->
            ({ model | safeness_lfi = value }, Cmd.none)
        Login -> (model, tryLogin model.username_login model.password_login model.safeness_login)
        XSS -> (model, tryXSS model.username_xss model.safeness_xss)
        PathTraversal -> (model, tryPathTraversal model.username_lfi model.path_lfi model.safeness_lfi)
        HttpRes (Ok ret) -> ({ model | result = ret, username_login = "", password_login = "", safeness_login = "", username_xss = "", safeness_xss = "", username_lfi = "", path_lfi = "", safeness_lfi = ""}, Cmd.none)
        HttpRes (Err ret) -> ({ model | result = (errorToString ret), username_login = "", password_login = "", safeness_login = "", username_xss = "", safeness_xss = "", username_lfi = "", path_lfi = "", safeness_lfi = ""}, Cmd.none)
tryLogin : String -> String -> String -> Cmd Msg
tryLogin username password safeness = Http.post { url = "/api/login", body = (Http.jsonBody (JE.object [ ( "username", JE.string username ), ( "password", JE.string password ), ( "safeness", JE.int (Maybe.withDefault 0 (String.toInt safeness)) ) ])), expect = Http.expectString HttpRes }

tryXSS : String -> String -> Cmd Msg
tryXSS username safeness = Http.post { url = "/api/show_xss", body = (Http.jsonBody (JE.object [ ( "username", JE.string username ), ( "safeness", JE.int (Maybe.withDefault 0 (String.toInt safeness)) ) ])), expect = Http.expectString HttpRes }

tryPathTraversal : String -> String -> String -> Cmd Msg
tryPathTraversal username path safeness = Http.post { url = "/api/path_traversal", body = (Http.jsonBody (JE.object [ ( "username", JE.string username ), ( "path", JE.string path ), ( "safeness", JE.int (Maybe.withDefault 0 (String.toInt safeness)) )])), expect = Http.expectString HttpRes }

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
        div [] [
                    div [] [ text "Login" ],
                    div [] [input [ type_ "text", placeholder "username", value model.username_login, onInput UsernameLogin ] [],
                            input [ type_ "password", placeholder "password", value model.password_login, onInput PasswordLogin ] [],
                            input [ type_ "number", (Html.Attributes.min "0"), (Html.Attributes.max "3"), (Html.Attributes.step "1"), placeholder "safeness", value model.safeness_login, onInput SafenessLogin ] []
                            ],
                    div [] [ button [ onClick Login ] [ text "Login" ]]
                ],
        div [] [
                    div [] [ text "XSS" ],
                    div [] [input [ type_ "text", placeholder "username", value model.username_xss, onInput UsernameXSS ] [],
                            input [ type_ "number", (Html.Attributes.min "0"), (Html.Attributes.max "2"), (Html.Attributes.step "1"), placeholder "safeness", value model.safeness_xss, onInput SafenessXSS ] []
                            ],
                    div [] [ button [ onClick XSS ] [ text "XSS" ]]
                ],
        div [] [
                    div [] [ text "PathTraversal" ],
                    div [] [input [ type_ "text", placeholder "username", value model.username_lfi, onInput UsernameLFI ] [],
                            input [ type_ "text", placeholder "path", value model.path_lfi, onInput PathLFI ] [],
                            input [ type_ "number", (Html.Attributes.min "0"), (Html.Attributes.max "3"), (Html.Attributes.step "1"), placeholder "safeness", value model.safeness_lfi, onInput SafenessLFI ] []
                            ],
                    div [] [ button [ onClick PathTraversal ] [ text "PathTraversal" ]]
                ],
    div [] <| Markdown.toHtml (Just customOptions) model.result
    ]