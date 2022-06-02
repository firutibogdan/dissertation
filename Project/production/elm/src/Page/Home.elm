module Page.Home exposing (..)

import Browser
import Markdown
import Markdown.Config exposing (Options, defaultOptions)
import Http exposing (..)
import Html exposing (Html, Attribute, div, input, text, button, object, iframe, textarea, br)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Json.Encode as JE
import Router exposing (Layout)
import Url exposing (Url)

type alias Model = {
        message : String,
        result : String
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ({
        message = "",
        result = ""
    }, Http.get { url = "/api/messages", expect = Http.expectString HttpRes })


type Msg = Send | Message String | HttpRes (Result Http.Error String) | HttpResPost (Result Http.Error String)

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Send -> (model, sendMsg model.message)
        Message value ->
            ({ model | message = value }, Cmd.none)
        HttpRes (Ok ret) -> ({ model | result = ret}, Cmd.none)
        HttpRes (Err ret) -> ({ model | result = "No messages"}, Cmd.none)
        HttpResPost (Ok ret) -> ({ model | message = "" }, Http.get { url = "/api/messages", expect = Http.expectString HttpRes })
        HttpResPost (Err ret) -> ({ model | message = "", result = "Error posting message"}, Cmd.none)

sendMsg : String -> Cmd Msg
sendMsg message = Http.post { url = "/api/message", body = (Http.jsonBody (JE.object [ ( "username", JE.string "admin" ), ( "message", JE.string message ) ])), expect = Http.expectString HttpResPost }


customOptions : Options
customOptions =
    { defaultOptions
    |   rawHtml = Markdown.Config.ParseUnsafe
    }

view : Model -> Layout Msg
view model = {
    title = Just "Home",
    attrs = [],
    main = [
            div[] [
                div [] [
                    div [] <| Markdown.toHtml (Just customOptions) model.result
                ],
                div[] [
                    br [] [], br [] [],
                    textarea [ cols 50, rows 5, placeholder "Write your message here", value model.message, onInput Message] [],
                    br [] [],
                    button [ onClick Send ] [ text "Send" ]
                ]
            ]
        ]
    }