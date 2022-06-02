module Page.Profile exposing (..)

import Browser
import Markdown
import Markdown.Config exposing (Options, defaultOptions)
import Http exposing (..)
import Html exposing (div, text)
import Html.Attributes exposing (..)
import Json.Encode as JE
import Router exposing (Layout)
import Url exposing (Url)

type alias Model = {
        result : String
    }


init : () -> (Maybe String) -> ( Model, Cmd Msg )
init _ currentUrl =
    ({
        result = ""
    }, Http.post { url = "/api/profile", body = (Http.jsonBody (JE.object [ 
        ( "username", JE.string (case currentUrl of
                Just str -> str
                Nothing -> "admin")) ])), expect = Http.expectString HttpRes })


type Msg = HttpRes (Result Http.Error String)

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        HttpRes (Ok ret) -> ({ model | result = ret}, Cmd.none)
        HttpRes (Err ret) -> ({ model | result = "No profile"}, Cmd.none)


customOptions : Options
customOptions =
    { defaultOptions
    |   rawHtml = Markdown.Config.ParseUnsafe
    }

view : Model -> Layout Msg
view model = {
    title = Just "Profile",
    attrs = [],
    main = [
            div [] [
                div [] <| Markdown.toHtml (Just customOptions) model.result
            ]
        ]
    }